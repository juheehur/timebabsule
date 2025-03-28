'use client'

import { Card } from '@/components/ui'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'
import { use } from 'react'
import html2canvas from 'html2canvas'
import { saveAs } from 'file-saver'

// 카카오 SDK 타입 정의
declare global {
  interface Window {
    Kakao: any;
  }
}

type Params = {
  id: string
}

export default function CapsuleDetailPage({ params }: { params: Promise<Params> }) {
  const resolvedParams = use(params)
  const [capsule, setCapsule] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const router = useRouter()
  const [isCopyLinkTooltip, setIsCopyLinkTooltip] = useState(false)
  const [isInstagramTooltip, setIsInstagramTooltip] = useState(false)
  const letterRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchCapsule = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          router.push('/capsule')
          return
        }

        const { data: capsule, error } = await supabase
          .from('time_capsules')
          .select('*')
          .eq('id', resolvedParams.id)
          .single()

        if (error) throw error
        if (!capsule) {
          router.push('/dashboard')
          return
        }

        setCapsule(capsule)
      } catch (error) {
        console.error('타임캡슐 조회 오류:', error)
        router.push('/dashboard')
      } finally {
        setLoading(false)
      }
    }

    fetchCapsule()
    
    // 카카오톡 SDK 로드
    const script = document.createElement('script')
    script.src = 'https://t1.kakaocdn.net/kakao_js_sdk/2.6.0/kakao.min.js'
    script.async = true
    script.onload = () => {
      if (window.Kakao && !window.Kakao.isInitialized()) {
        // 카카오 개발자 사이트에서 발급받은 JavaScript 키로 변경
        window.Kakao.init('75708d9f177f631eb08be426a10e55a3')
        console.log('Kakao SDK initialized with key:', '75708d9f177f631eb08be426a10e55a3')
      }
    }
    document.body.appendChild(script)
    
    return () => {
      if (script.parentNode) {
        document.body.removeChild(script)
      }
    }
  }, [resolvedParams.id, router])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`
  }

  const calculateDaysDifference = (date1: string, date2: string) => {
    const oneDay = 24 * 60 * 60 * 1000
    const firstDate = new Date(date1)
    const secondDate = new Date(date2)
    const diffDays = Math.round(Math.abs((firstDate.getTime() - secondDate.getTime()) / oneDay))
    return diffDays
  }
  
  const shareInstagram = async () => {
    try {
      if (!letterRef.current) return
      
      setIsDownloading(true)
      const canvas = await html2canvas(letterRef.current, {
        backgroundColor: '#ffffff',
        useCORS: true,
        scale: 2
      })
      
      // 캔버스를 이미지로 변환
      const image = canvas.toDataURL('image/png')
      
      // 이미지 다운로드 링크 생성
      const link = document.createElement('a')
      link.href = image
      link.download = `타임밥슐_${capsule?.title || '편지'}.png`
      link.click()
      
      // 인스타그램으로 공유하는 방법 안내 툴팁 표시
      setIsInstagramTooltip(true)
      setTimeout(() => setIsInstagramTooltip(false), 3000)
    } catch (error) {
      console.error('인스타그램 공유 오류:', error)
      alert('이미지 생성 중 오류가 발생했습니다.')
    } finally {
      setIsDownloading(false)
    }
  }
  
  const shareTwitter = () => {
    const text = `타임밥슐: ${capsule?.title || '미래의 나에게 보내는 편지'} - 소중한 추억을 담아 미래의 나에게 선물해보세요.`
    const url = window.location.href
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`
    window.open(twitterUrl, '_blank')
  }
  
  const copyLinkToClipboard = () => {
    const url = window.location.href
    navigator.clipboard.writeText(url)
      .then(() => {
        setIsCopyLinkTooltip(true)
        setTimeout(() => setIsCopyLinkTooltip(false), 3000)
      })
      .catch(err => {
        console.error('링크 복사 오류:', err)
        alert('링크를 복사하는 데 실패했습니다.')
      })
  }
  
  const downloadLetter = async () => {
    try {
      setIsDownloading(true)
      const letterElement = document.getElementById('letter-content')
      if (!letterElement) return
      
      // 편지 내용을 새로운 요소에 복제하여 3:4 비율로 렌더링
      const tempContainer = document.createElement('div')
      tempContainer.style.position = 'absolute'
      tempContainer.style.left = '-9999px'
      tempContainer.style.top = '-9999px'
      
      // 이미지가 포함된 전체 편지 요소 생성
      const letterCard = document.createElement('div')
      letterCard.style.width = '900px'
      letterCard.style.height = '1200px'
      letterCard.style.backgroundColor = '#fff9f9'
      letterCard.style.boxSizing = 'border-box'
      letterCard.style.fontFamily = capsule.font_family || 'Arial'
      letterCard.style.position = 'relative'
      letterCard.style.overflow = 'hidden'
      
      // 배경 장식 요소 추가
      const decoration = document.createElement('div')
      decoration.style.position = 'absolute'
      decoration.style.top = '0'
      decoration.style.left = '0'
      decoration.style.width = '100%'
      decoration.style.height = '200px'
      decoration.style.backgroundColor = '#ffebeb'
      decoration.style.borderBottomRightRadius = '100px'
      letterCard.appendChild(decoration)
      
      // 타임밥슐 로고 영역
      const logoContainer = document.createElement('div')
      logoContainer.style.position = 'absolute'
      logoContainer.style.top = '20px'
      logoContainer.style.left = '40px'
      logoContainer.style.display = 'flex'
      logoContainer.style.alignItems = 'center'
      
      const logoText = document.createElement('div')
      logoText.textContent = '타임밥슐'
      logoText.style.fontSize = '24px'
      logoText.style.fontWeight = 'bold'
      logoText.style.color = '#ff6b6b'
      
      logoContainer.appendChild(logoText)
      letterCard.appendChild(logoContainer)
      
      // 본문 컨테이너
      const contentContainer = document.createElement('div')
      contentContainer.style.padding = '40px'
      contentContainer.style.marginTop = '80px'
      contentContainer.style.display = 'flex'
      contentContainer.style.flexDirection = 'column'
      contentContainer.style.height = 'calc(100% - 160px)'
      contentContainer.style.boxSizing = 'border-box'
      
      // 이미지 영역 추가
      const imageContainer = document.createElement('div')
      imageContainer.style.width = '820px'
      imageContainer.style.height = '360px'
      imageContainer.style.marginBottom = '0px'
      imageContainer.style.backgroundColor = '#f0f0f0'
      imageContainer.style.borderRadius = '16px'
      imageContainer.style.overflow = 'hidden'
      imageContainer.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'
      
      // 직접 이미지 배경 설정
      imageContainer.style.backgroundImage = `url(${capsule.image_url})`
      imageContainer.style.backgroundSize = 'cover'
      imageContainer.style.backgroundPosition = 'center'
      
      contentContainer.appendChild(imageContainer)
      
      // 편지 내용 영역
      const letterContentBox = document.createElement('div')
      letterContentBox.style.backgroundColor = 'white'
      letterContentBox.style.borderRadius = '16px'
      letterContentBox.style.padding = '40px'
      letterContentBox.style.flexGrow = '1'
      letterContentBox.style.display = 'flex'
      letterContentBox.style.flexDirection = 'column'
      letterContentBox.style.boxShadow = '0 4px 12px rgba(0,0,0,0.04)'
      
      // 수신자 (To)
      const toDiv = document.createElement('div')
      toDiv.style.textAlign = 'center'
      toDiv.style.marginBottom = '20px'
      toDiv.style.fontSize = '24px'
      toDiv.style.color = '#666666'
      toDiv.style.fontFamily = capsule.font_family || 'Arial'
      toDiv.textContent = `To. ${daysDiff}일 뒤의 나에게`
      
      // 제목
      const titleDiv = document.createElement('h1')
      titleDiv.style.textAlign = 'center'
      titleDiv.style.fontSize = '36px'
      titleDiv.style.fontWeight = 'bold'
      titleDiv.style.margin = '0 0 40px 0'
      titleDiv.style.color = '#333333'
      titleDiv.style.fontFamily = capsule.font_family || 'Arial'
      titleDiv.textContent = capsule.title
      
      // 내용
      const contentDiv = document.createElement('p')
      contentDiv.style.fontSize = '24px'
      contentDiv.style.lineHeight = '1'
      contentDiv.style.color = '#333333'
      contentDiv.style.margin = '0'
      contentDiv.style.flexGrow = '1'
      contentDiv.style.whiteSpace = 'pre-wrap'
      contentDiv.style.fontFamily = capsule.font_family || 'Arial'
      contentDiv.textContent = capsule.letter_content
      
      // 발신자 (From)
      const fromContainer = document.createElement('div')
      fromContainer.style.textAlign = 'right'
      fromContainer.style.marginTop = '60px'
      
      const fromDiv = document.createElement('div')
      fromDiv.style.fontSize = '24px'
      fromDiv.style.color = '#666666'
      fromDiv.style.fontFamily = capsule.font_family || 'Arial'
      fromDiv.textContent = `From. ${daysDiff}일 전의 나로부터`
      
      const dateDiv = document.createElement('div')
      dateDiv.style.fontSize = '18px'
      dateDiv.style.color = '#888888'
      dateDiv.style.marginTop = '12px'
      dateDiv.textContent = `${formatDate(capsule.created_at)}에 작성된 편지`
      
      fromContainer.appendChild(fromDiv)
      fromContainer.appendChild(dateDiv)
      
      // 편지 내용 영역에 요소들 추가
      letterContentBox.appendChild(toDiv)
      letterContentBox.appendChild(titleDiv)
      letterContentBox.appendChild(contentDiv)
      letterContentBox.appendChild(fromContainer)
      
      // 콘텐츠 컨테이너에 편지 내용 영역 추가
      contentContainer.appendChild(letterContentBox)
      
      // 바닥글 영역
      const footer = document.createElement('div')
      footer.style.position = 'absolute'
      footer.style.bottom = '20px'
      footer.style.right = '40px'
      footer.style.fontSize = '14px'
      footer.style.color = '#999999'
      footer.textContent = 'timebabsule.me'
      
      // 최종 구성
      letterCard.appendChild(contentContainer)
      letterCard.appendChild(footer)
      
      // 임시 컨테이너에 추가
      tempContainer.appendChild(letterCard)
      document.body.appendChild(tempContainer)
      
      // 배경색 강제 설정 (문서 바디에도 적용)
      document.body.style.backgroundColor = '#ffffff'
      
      // 이미지 캡처 및 다운로드
      const canvas = await html2canvas(letterCard, {
        scale: 2, // 고해상도
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#fff9f9',
        onclone: (document, element) => {
          // 복제된 문서에서도 oklch 색상 제거
          element.style.backgroundColor = '#fff9f9'
          const elements = element.querySelectorAll('*')
          elements.forEach(el => {
            if (el instanceof HTMLElement) {
              el.style.backgroundColor = ''
            }
          })
        }
      })
      
      // 임시 요소 제거
      document.body.removeChild(tempContainer)
      
      // 원래 배경색 복원
      document.body.style.backgroundColor = ''
      
      canvas.toBlob((blob: Blob | null) => {
        if (blob) {
          saveAs(blob, `타임밥슐_${capsule.title}.png`)
        }
        setIsDownloading(false)
      }, 'image/png', 1.0)
    } catch (error) {
      console.error('편지 다운로드 오류:', error)
      alert('편지 다운로드 중 오류가 발생했습니다. 다시 시도해주세요.')
      setIsDownloading(false)
    }
  }

  // 현재 날짜를 가져오는 함수 (디버그 모드 지원)
  const getCurrentDate = () => {
    if (typeof window !== 'undefined') {
      const debugDate = localStorage.getItem('debugDate')
      if (debugDate) {
        return new Date(debugDate)
      }
    }
    return new Date()
  }

  // 타임밥슐을 열 수 있는지 확인하는 함수
  const canOpenCapsule = (openDate: string) => {
    const now = getCurrentDate()
    const openingDate = new Date(openDate)
    return now >= openingDate
  }

  // 남은 날짜 계산
  const calculateRemainingDays = (openDate: string) => {
    const now = getCurrentDate()
    const openingDate = new Date(openDate)
    const diffTime = openingDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 0
  }

  // 카카오톡 공유하기
  const shareKakao = () => {
    console.log('카카오 공유 함수 호출됨')
    if (typeof window !== 'undefined' && window.Kakao) {
      console.log('카카오 SDK 있음, 초기화 상태:', window.Kakao.isInitialized())
      try {
        window.Kakao.Share.sendDefault({
          objectType: 'feed',
          content: {
            title: `타임밥슐: ${capsule?.title || '미래의 나에게 보내는 편지'}`,
            description: '소중한 추억을 담아 미래의 나에게 선물해보세요.',
            imageUrl: capsule?.image_url || `${window.location.origin}/images/main.png`,
            link: {
              webUrl: window.location.href,
              mobileWebUrl: window.location.href,
            },
          },
          buttons: [
            {
              title: '타임밥슐 보기',
              link: {
                webUrl: window.location.href,
                mobileWebUrl: window.location.href,
              },
            },
            {
              title: '나도 만들기',
              link: {
                webUrl: window.location.origin,
                mobileWebUrl: window.location.origin,
              },
            },
          ],
        })
      } catch (error) {
        console.error('카카오톡 공유 중 오류 발생:', error)
        // 타입 안전한 방식으로 오류 메시지 추출
        const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
        alert('카카오톡 공유하기를 사용할 수 없습니다. 오류: ' + errorMessage)
      }
    } else {
      console.error('카카오 SDK를 찾을 수 없음')
      alert('카카오톡 공유하기를 사용할 수 없습니다. 카카오 SDK가 로드되지 않았습니다.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white py-8 px-4">
        <div className="max-w-4xl mx-auto flex justify-center items-center min-h-[50vh]">
          <div className="w-8 h-8 border-4 border-pink-200 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  const daysDiff = calculateDaysDifference(capsule.created_at, capsule.open_date)
  const isOpenable = canOpenCapsule(capsule.open_date)
  const remainingDays = calculateRemainingDays(capsule.open_date)

  return (
    <div className="min-h-screen bg-white py-12 px-6">
      {isImageModalOpen && (
        <div 
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          onClick={() => setIsImageModalOpen(false)}
        >
          <div className="relative w-full max-w-5xl aspect-video">
            <Image
              src={capsule.image_url}
              alt={capsule.title}
              fill
              className="object-contain"
              sizes="(max-width: 1024px) 100vw, 1024px"
              priority
            />
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <span>←</span>
            <span>돌아가기</span>
          </button>
          <div className="text-gray-600">
            개봉일: {formatDate(capsule.open_date)}
          </div>
        </div>

        <div className="bg-white">
          <div className="p-10 space-y-10">
            {!isOpenable ? (
              <div className="bg-pink-50 p-8 rounded-xl text-center space-y-6">
                <div className="w-20 h-20 mx-auto bg-pink-100 rounded-full flex items-center justify-center">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FF6B6B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">아직 열 수 없어요</h2>
                <p className="text-gray-600">
                  이 타임밥슐은 {formatDate(capsule.open_date)}에 열 수 있어요.<br />
                  조금만 더 기다려주세요!
                </p>
                <div className="bg-white p-6 rounded-lg shadow-sm inline-block mx-auto">
                  <div className="text-3xl font-bold text-pink-500">{remainingDays}일</div>
                  <div className="text-gray-500 text-sm">남았어요</div>
                </div>
                <p className="text-sm text-gray-500 mt-4">
                  타임밥슐은 설정한 개봉일이 되어야 내용을 확인할 수 있습니다.<br />
                  그때까지 조금만 더 기다려주세요.
                </p>
              </div>
            ) : (
              <>
                <div 
                  className="relative w-full aspect-video bg-gray-100 rounded-lg overflow-hidden mb-10 cursor-pointer group"
                  onClick={() => setIsImageModalOpen(true)}
                >
                  <Image
                    src={capsule.image_url}
                    alt={capsule.title}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                    <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      클릭하여 크게 보기
                    </span>
                  </div>
                </div>

                <div id="letter-content" className="bg-[#fffafa] rounded-xl p-10 space-y-10" ref={letterRef}>
                  <div className="text-center text-gray-500 mb-10">
                    To. {daysDiff}일 뒤의 나에게
                  </div>
                  
                  <h1 
                    className="text-2xl mb-8 text-center"
                    style={{ fontFamily: capsule.font_family || 'omyu_pretty' }}
                  >
                    {capsule.title}
                  </h1>
                  
                  <p 
                    className="whitespace-pre-wrap text-gray-700 text-lg leading-relaxed min-h-[200px]"
                    style={{ fontFamily: capsule.font_family || 'omyu_pretty' }}
                  >
                    {capsule.letter_content}
                  </p>

                  <div className="text-right space-y-2 mt-10">
                    <div className="text-gray-500">
                      From. {daysDiff}일 전의 나로부터
                    </div>
                    <div className="text-sm text-gray-400">
                      {formatDate(capsule.created_at)}에 작성된 편지
                    </div>
                  </div>
                </div>
                
                {/* 공유 버튼 영역 */}
                <div className="flex flex-wrap gap-4 justify-center mt-8">
                  {/* 카카오톡 공유 */}
                  <button 
                    onClick={shareKakao}
                    className="flex items-center justify-center w-12 h-12 rounded-full bg-[#FEE500] hover:bg-[#FDD700] transition-colors"
                    aria-label="카카오톡으로 공유하기"
                  >
                    <svg width="22" height="20" viewBox="0 0 22 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" clipRule="evenodd" d="M11 0C4.92481 0 0 3.70103 0 8.26566C0 11.0147 1.82508 13.4289 4.56155 14.8165C4.36583 15.5022 3.83742 17.5602 3.72828 18.0452C3.59344 18.6514 3.9192 18.6427 4.17201 18.4683C4.37474 18.3293 6.77248 16.6893 7.88594 15.9147C8.90266 16.0843 9.93794 16.1756 11 16.1756C17.0751 16.1756 22 12.4746 22 7.90994C22 3.34532 17.0751 0 11 0Z" fill="#391B1B"/>
                    </svg>
                  </button>

                  {/* 트위터(X) 공유 */}
                  <button 
                    onClick={shareTwitter}
                    className="flex items-center justify-center w-12 h-12 rounded-full bg-black hover:bg-gray-800 transition-colors"
                    aria-label="X(트위터)로 공유하기"
                  >
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor" stroke="white">
                      <path d="M23,6.628l-2.212,0.805c0.796-0.477,1.407-1.231,1.696-2.127c-0.745,0.443-1.572,0.764-2.451,0.937 c-0.704-0.751-1.708-1.221-2.817-1.221c-2.13,0-3.859,1.729-3.859,3.859c0,0.302,0.034,0.596,0.1,0.879C9.161,9.479,5.18,7.937,3.16,5.528 C2.831,6.102,2.648,6.759,2.648,7.457c0,1.338,0.682,2.519,1.72,3.209c-0.633-0.02-1.228-0.193-1.748-0.482v0.049 c0,1.869,1.328,3.429,3.09,3.783c-0.323,0.088-0.663,0.135-1.014,0.135c-0.248,0-0.489-0.024-0.724-0.069 c0.49,1.533,1.914,2.65,3.602,2.681c-1.32,1.034-2.983,1.65-4.79,1.65c-0.312,0-0.619-0.018-0.921-0.054 c1.705,1.093,3.73,1.731,5.907,1.731c7.089,0,10.968-5.869,10.968-10.967c0-0.167-0.003-0.334-0.011-0.5 C21.804,8.055,22.483,7.392,23,6.628z"/>
                    </svg>
                  </button>

                  {/* 인스타그램 공유 */}
                  <div className="relative">
                    <button 
                      onClick={shareInstagram}
                      className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#FCAF45] text-white hover:opacity-90 transition-opacity"
                      aria-label="인스타그램 공유"
                    >
                      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                    </button>
                    {isInstagramTooltip && (
                      <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-3 py-1 rounded text-sm whitespace-nowrap">
                        이미지가 저장되었습니다!
                      </div>
                    )}
                  </div>

                  {/* 링크 복사 */}
                  <div className="relative">
                    <button 
                      onClick={copyLinkToClipboard}
                      className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors"
                      aria-label="링크 복사"
                    >
                      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                      </svg>
                    </button>
                    {isCopyLinkTooltip && (
                      <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-3 py-1 rounded text-sm whitespace-nowrap">
                        링크가 복사되었습니다!
                      </div>
                    )}
                  </div>

                  {/* 편지 다운로드 */}
                  <button 
                    onClick={downloadLetter}
                    disabled={isDownloading}
                    className="flex items-center justify-center w-12 h-12 rounded-full bg-pink-100 text-gray-800 hover:bg-pink-200 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                    aria-label="편지 다운로드"
                  >
                    {isDownloading ? (
                      <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                      </svg>
                    )}
                  </button>
                </div>
              </>
            )}

            {/* 타임밥슐 제안 */}
            <div className="mt-12 p-6 bg-pink-50 rounded-xl">
              <h2 className="text-xl font-bold text-gray-800 mb-4">다음 타임밥슐은 어떠세요?</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                  <div className="text-lg font-semibold text-gray-800 mb-2">1년 후의 나에게</div>
                  <p className="text-gray-600 text-sm">1년 동안의 변화와 성장을 기록해보세요</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                  <div className="text-lg font-semibold text-gray-800 mb-2">취업 후의 나에게</div>
                  <p className="text-gray-600 text-sm">취업 준비 중인 지금의 마음을 전해보세요</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                  <div className="text-lg font-semibold text-gray-800 mb-2">결혼 후의 나에게</div>
                  <p className="text-gray-600 text-sm">미래의 배우자에게 전하는 메시지를 남겨보세요</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 