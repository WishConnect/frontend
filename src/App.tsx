import Header from './components/common/Header/Header'
import './App.css'

function App() {
  return (
    <>
      <Header searchPlaceholder="내가 스크랩한 장학금 찾아보기" />
      <Header isSearchMode={true} />
    </>
  )
}

export default App
