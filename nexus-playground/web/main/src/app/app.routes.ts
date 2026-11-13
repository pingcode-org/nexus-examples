import { Routes } from '@pc-nexus/angular/router';
import { IdeaComponent } from './capability/idea/idea';
import { NotifyComponent } from './capability/notify/notify';
import { PageComponent } from './capability/page/page';
import { ProcessorComponent } from './capability/processor/processor';
import { RichtextComponent } from './capability/richtext/richtext';
import { TestcaseComponent } from './capability/testcase/testcase';
import { TicketComponent } from './capability/ticket/ticket';
import { UserComponent } from './capability/user/user';
import { WorkitemComponent } from './capability/workitem/workitem';

export interface CapabilityItem {
  id: string;
  label: string;
  description: string;
}

export const CAPABILITY_GROUP = 'capabilities';

export const CAPABILITIES: CapabilityItem[] = [
  {
    id: 'user',
    label: 'user',
    description: '用户弹层与信息展示',
  },
  {
    id: 'notify',
    label: 'notify',
    description: '平台通知',
  },
  {
    id: 'processor',
    label: 'processor',
    description: '使用进程管理器',
  },
  {
    id: 'richtext',
    label: 'richtext',
    description: '富文本编辑与渲染',
  },
  {
    id: 'workitem',
    label: 'workitem',
    description: '工作项创建与详情',
  },
  {
    id: 'idea',
    label: 'idea',
    description: '需求创建与详情',
  },
  {
    id: 'ticket',
    label: 'ticket',
    description: '工单创建与详情',
  },
  {
    id: 'testcase',
    label: 'testcase',
    description: '用例创建与详情',
  },
  {
    id: 'page',
    label: 'page',
    description: '页面创建与详情',
  },
];

function pageComponent(id: string) {
  switch (id) {
    case 'user':
      return UserComponent;
    case 'notify':
      return NotifyComponent;
    case 'processor':
      return ProcessorComponent;
    case 'richtext':
      return RichtextComponent;
    case 'workitem':
      return WorkitemComponent;
    case 'idea':
      return IdeaComponent;
    case 'ticket':
      return TicketComponent;
    case 'testcase':
      return TestcaseComponent;
    case 'page':
      return PageComponent;
    default:
      return UserComponent;
  }
}

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: `${CAPABILITY_GROUP}/user` },
  {
    path: CAPABILITY_GROUP,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'user' },
      ...CAPABILITIES.map((item) => ({
        path: item.id,
        component: pageComponent(item.id),
        data: {
          label: item.label,
          description: item.description,
        },
      })),
    ],
  },
  { path: '**', redirectTo: `${CAPABILITY_GROUP}/user` },
];
