import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { invoke } from '@pc-nexus/bridge';
import { user } from '@pc-nexus/capabilities';
import { ThyAvatar, ThyAvatarList } from 'ngx-tethys/avatar';
import { ThyButton } from 'ngx-tethys/button';
import { ThyDivider } from 'ngx-tethys/divider';

interface Member {
  id: string;
  name?: string;
  display_name?: string;
  avatar?: string;
}

interface UserSelectionValue {
  dialogMultiple: string[];
  popoverSingle: string | null;
  popoverMultiple: string[];
}

interface UserSelectionResult {
  value: UserSelectionValue;
  references: {
    members?: Member[];
  };
}

interface UserSelectionSlotResult {
  slot: 'users_dialog' | 'user_popover' | 'users_popover';
  memberIds: string[];
  references: {
    members?: Member[];
  };
}

@Component({
  selector: 'app-user',
  imports: [ThyAvatar, ThyAvatarList, ThyButton, ThyDivider],
  templateUrl: './user.html',
  styleUrl: './user.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserComponent {
  protected readonly dialogMultiple = signal<Member[]>([]);
  protected readonly popoverSingle = signal<Member | null>(null);
  protected readonly popoverMultiple = signal<Member[]>([]);

  constructor() {
    void this.load();
  }

  protected label(person: Member): string {
    return person.display_name || person.name || person.id;
  }

  private async load() {
    const result = await invoke<void, UserSelectionResult>('get-user-selection');
    const members = this.memberMap(result.references?.members);
    const personOf = (id: string): Member => members.get(id) ?? { id };
    const value = result.value;
    this.dialogMultiple.set((value?.dialogMultiple ?? []).map(personOf));
    this.popoverSingle.set(value?.popoverSingle ? personOf(value.popoverSingle) : null);
    this.popoverMultiple.set((value?.popoverMultiple ?? []).map(personOf));
  }

  protected async openDialogMultiple() {
    await user.openDialog({
      title: '选择成员',
      selection: this.dialogMultiple().map((person) => person.id),
      onConfirm: async (_ids, users) => {
        this.dialogMultiple.set(users ?? []);
        await this.save('save-users-dialog', this.dialogMultiple());
      },
    });
  }

  protected async openPopoverSingle(event: Event) {
    const origin = event.currentTarget;
    if (!(origin instanceof HTMLElement)) {
      return;
    }
    const ref = await user.openPopover({
      origin,
      multiple: false,
      selection: this.popoverSingle()?.id,
      onConfirm: async (_id, person) => {
        this.popoverSingle.set(person ?? null);
        ref?.close();
        await this.save('save-user-popover', this.popoverSingle() ? [this.popoverSingle()!] : []);
      },
    });
  }

  protected async openPopoverMultiple(event: Event) {
    const origin = event.currentTarget;
    if (!(origin instanceof HTMLElement)) {
      return;
    }
    await user.openPopover({
      origin,
      multiple: true,
      selection: this.popoverMultiple().map((person) => person.id),
      onConfirm: async (_ids, users) => {
        this.popoverMultiple.set(users ?? []);
        await this.save('save-users-popover', this.popoverMultiple());
      },
    });
  }

  protected removeDialogMultiple(id: string) {
    this.dialogMultiple.update((list) => list.filter((person) => person.id !== id));
    void this.save('save-users-dialog', this.dialogMultiple());
  }

  protected removePopoverSingle() {
    this.popoverSingle.set(null);
    void this.save('save-user-popover', []);
  }

  protected removePopoverMultiple(id: string) {
    this.popoverMultiple.update((list) => list.filter((person) => person.id !== id));
    void this.save('save-users-popover', this.popoverMultiple());
  }

  private async save(
    functionKey: 'save-users-dialog' | 'save-user-popover' | 'save-users-popover',
    members: Member[],
  ) {
    const result = await invoke<string[], UserSelectionSlotResult>(
      functionKey,
      members.map((person) => person.id),
    );
    const membersMap = this.memberMap(result.references?.members);
    const people = (result.memberIds ?? []).map((id) => membersMap.get(id) ?? { id });
    switch (result.slot) {
      case 'users_dialog':
        this.dialogMultiple.set(people);
        break;
      case 'user_popover':
        this.popoverSingle.set(people[0] ?? null);
        break;
      case 'users_popover':
        this.popoverMultiple.set(people);
        break;
    }
  }

  private memberMap(members: Member[] | undefined): Map<string, Member> {
    const map = new Map<string, Member>();
    for (const member of members ?? []) {
      if (member?.id) {
        map.set(member.id, member);
      }
    }
    return map;
  }
}
