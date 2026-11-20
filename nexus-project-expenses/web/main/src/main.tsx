import { view } from "@pc-nexus/bridge"
import ExpenseDialog from "./ExpenseDialog.js"
import { ConfigProvider } from 'antd'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.js'

const root = createRoot(document.getElementById('root')!)

function render(isDialog: boolean) {
  root.render(
    <StrictMode>
      <ConfigProvider theme={{
        token: {
          colorBgBase: '#fff',
          // ngx-tethys 默认浅色主题和中号控件规格。
          colorTextBase: '#333',
          colorBorder: '#eee',
          colorBorderSecondary: '#eee',
          colorTextPlaceholder: '#cacaca',
          colorBgContainerDisabled: '#f5f5f5',
          fontSize: 14,
          borderRadius: 4,
          controlHeight: 32,
          controlHeightSM: 28,
          controlHeightLG: 36,
          controlOutlineWidth: 1,
          colorPrimary: '#6698ff',
          colorSuccess: '#73d897',
          colorInfo: '#5dcfff',
          colorWarning: '#ffcd5d',
          colorError: '#ff7575',
        },
        components: {
          Button: {
            primaryColor: '#fff',
            primaryShadow: 'none',
            defaultShadow: 'none',
            paddingInline: 15,
          },
          Table: {
            headerBg: '#f2f2f2',
            colorBgContainer: '#f7f7f7',
            fontWeightStrong: 400,
            headerColor: '#333',
            cellPaddingBlock: 12,
            cellPaddingInline: 16,
            headerSplitColor: 'transparent',
          },
        },
      }}>
        {isDialog ? <ExpenseDialog /> : <App />}
      </ConfigProvider>
    </StrictMode>,
  )
}

void view.isDialog().then(render, () => render(false))
