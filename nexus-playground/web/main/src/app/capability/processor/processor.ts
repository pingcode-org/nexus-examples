import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { invoke } from '@pc-nexus/bridge';
import { processor, type ProcessRef } from '@pc-nexus/capabilities';
import { ThyButton } from 'ngx-tethys/button';

interface UploadMetadata {
  size: number;
  checksum: string;
  checksum_type: 'SHA256';
}

interface UploadObject extends UploadMetadata {
  key: string;
}

interface UploadTask {
  ref: ProcessRef;
  xhr?: XMLHttpRequest;
}

const PROCESS_FILE_ICON =
  'data:image/svg+xml;charset=utf-8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="#999"><path fill-rule="evenodd" d="M10.203 10.852a.6.6 0 010 1.2H5.714a.6.6 0 110-1.2h4.49zM5.114 8.843a.6.6 0 01.6-.6h4.49a.599.599 0 110 1.2h-4.49a.6.6 0 01-.6-.6zm7.603 4.546V6.346H8.442V2.2H3.58a.377.377 0 00-.381.371V13.39c0 .205.17.371.38.371h8.758c.209 0 .38-.166.38-.37zM9.642 2.67v2.476h2.5l-2.5-2.476zM9.662 1l4.254 4.216v8.173c0 .866-.708 1.571-1.58 1.571H3.58c-.871 0-1.58-.705-1.58-1.57V2.57c0-.866.709-1.57 1.58-1.57h6.082z"/></svg>',
  );

@Component({
  selector: 'app-processor',
  imports: [ThyButton],
  templateUrl: './processor.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProcessorComponent implements OnDestroy {
  private readonly stopped = new Set<string>();
  private readonly tasks = new Map<string, UploadTask>();
  private destroyed = false;

  ngOnDestroy(): void {
    this.destroyed = true;
    for (const [id, task] of this.tasks) {
      this.stopped.add(id);
      task.xhr?.abort();
      task.ref.cancel();
    }
    this.tasks.clear();
  }

  protected upload(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = [...(input.files ?? [])];
    input.value = '';
    for (const file of files) {
      void this.uploadFile(file);
    }
  }

  private async uploadFile(file: File) {
    const ref = await processor.add(
      {
        name: file.name,
        icon: PROCESS_FILE_ICON,
      },
      {
        onCancel: (processId) => {
          this.stopped.add(processId);
          this.tasks.get(processId)?.xhr?.abort();
        },
      },
    );
    this.tasks.set(ref.id, { ref });

    try {
      this.assertActive(ref.id);
      ref.setProgress(0);
      const metadata = await fileMetadata(file);
      this.assertActive(ref.id);

      const urls = await invoke<UploadMetadata[], Record<string, UploadObject>>(
        'generate-upload-urls',
        [metadata],
      );
      const uploaded = Object.entries(urls).find(([, body]) => body.checksum === metadata.checksum);
      if (!uploaded) {
        throw new Error('上传失败');
      }
      this.assertActive(ref.id);

      const [uploadUrl, body] = uploaded;
      await this.putFile(ref, uploadUrl, file);
      const fileUrl = await invoke<string, string>('create-download-url', body.key);
      this.assertActive(ref.id);
      ref.setProgress(100);
      ref.complete({ fileUrl });
    } catch (err) {
      if (err instanceof UploadCancelled || this.isInactive(ref.id)) {
        return;
      }
      ref.error(err instanceof Error && err.message ? err.message : '上传失败');
    } finally {
      this.tasks.delete(ref.id);
      this.stopped.delete(ref.id);
    }
  }

  private putFile(ref: ProcessRef, url: string, file: File): Promise<void> {
    return new Promise((resolve, reject) => {
      const task = this.tasks.get(ref.id);
      if (!task || this.isInactive(ref.id)) {
        reject(new UploadCancelled());
        return;
      }

      const xhr = new XMLHttpRequest();
      task.xhr = xhr;
      const formData = new FormData();
      formData.append('file', file, file.name);
      let reported = -1;

      xhr.open('PUT', url);
      xhr.upload.onprogress = (event) => {
        if (this.isInactive(ref.id) || !event.lengthComputable || event.total <= 0) {
          return;
        }
        const percent = Math.min(99, Math.round((event.loaded / event.total) * 100));
        if (percent === reported) {
          return;
        }
        reported = percent;
        ref.setProgress(percent);
      };
      xhr.onload = () => {
        if (this.isInactive(ref.id)) {
          reject(new UploadCancelled());
          return;
        }
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
          return;
        }
        reject(new Error(`Upload failed with status ${xhr.status}`));
      };
      xhr.onerror = () => reject(new Error('Upload failed'));
      xhr.onabort = () => reject(new UploadCancelled());
      xhr.send(formData);
      if (this.isInactive(ref.id)) {
        xhr.abort();
      }
    });
  }

  private assertActive(processId: string): void {
    if (this.isInactive(processId)) {
      throw new UploadCancelled();
    }
  }

  private isInactive(processId: string): boolean {
    return this.destroyed || this.stopped.has(processId);
  }
}

class UploadCancelled extends Error {
  override name = 'UploadCancelled';
}

async function fileMetadata(file: File): Promise<UploadMetadata> {
  const digest = await crypto.subtle.digest('SHA-256', await file.arrayBuffer());
  return {
    size: file.size,
    checksum: btoa(String.fromCharCode(...new Uint8Array(digest))),
    checksum_type: 'SHA256',
  };
}
