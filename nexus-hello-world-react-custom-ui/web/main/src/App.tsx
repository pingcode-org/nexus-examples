import { useEffect, useState } from 'react'
import { invoke } from '@pc-nexus/bridge'

function App() {
  const [result, setResult] = useState<string | null>(null)

  useEffect(() => {
    invoke<string, string>('greeting', 'Nexus')
      .then((res) => setResult(res))
      .catch((err: Error) => setResult(`错误：${err}`))
  }, [])

  return <p>{result}</p>
}

export default App
