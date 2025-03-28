'use client'

import Image from 'next/image'
import { Button } from '@/components/ui'
import { RiKakaoTalkFill } from 'react-icons/ri'
import { FaXTwitter, FaInstagram } from 'react-icons/fa6'
import { FiLink } from 'react-icons/fi'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function Home() {
  const router = useRouter()
  const [userCount, setUserCount] = useState(0)
  const [isLinkTooltip, setIsLinkTooltip] = useState(false)

  useEffect(() => {
    const fetchUserCount = async () => {
      const supabase = createClient()
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
      
      setUserCount(count || 0)
    }

    fetchUserCount()

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
  }, [])

  const handleCreateCapsule = () => {
    router.push('/login')
  }

  // 카카오톡 공유하기
  const shareKakao = () => {
    if (typeof window !== 'undefined' && window.Kakao) {
      window.Kakao.Share.sendDefault({
        objectType: 'feed',
        content: {
          title: '타임밥슐 - 미래의 나에게 보내는 편지',
          description: '소중한 추억을 담아 미래의 나에게 선물해보세요.',
          imageUrl: `${window.location.origin}/images/main.png`,
          link: {
            webUrl: window.location.origin,
            mobileWebUrl: window.location.origin,
          },
        },
        buttons: [
          {
            title: '타임밥슐 만들기',
            link: {
              webUrl: window.location.origin,
              mobileWebUrl: window.location.origin,
            },
          },
        ],
      })
    } else {
      alert('카카오톡 공유하기를 사용할 수 없습니다.')
    }
  }

  // 트위터(X) 공유하기
  const shareTwitter = () => {
    const text = '타임밥슐 - 미래의 나에게 보내는 편지'
    const url = window.location.origin
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank')
  }

  // 인스타그램 공유하기 (스토리로 이동)
  const shareInstagram = () => {
    alert('이미지를 저장한 후 인스타그램 스토리에 공유해보세요!')
    // 인스타그램 앱으로 이동
    window.open('instagram://story-camera', '_blank')
    // 앱이 없으면 인스타그램 웹사이트로 이동
    setTimeout(() => {
      window.open('https://instagram.com', '_blank')
    }, 500)
  }

  // 링크 복사하기
  const copyLink = () => {
    navigator.clipboard.writeText(window.location.origin)
    setIsLinkTooltip(true)
    setTimeout(() => setIsLinkTooltip(false), 2000)
  }

  return (
    <main className="min-h-screen relative">
      {/* 배경 이미지 */}
      <Image
        src="/images/bg.png"
        alt="배경"
        fill
        className="object-cover"
        priority
      />
      
      {/* 콘텐츠 레이어 */}
      <div className="relative z-10">
        {/* 상단 로고 */}
        <div className="w-full bg-white/90 backdrop-blur-sm py-4 px-6 shadow-sm">
          <Image
            src="/images/logo.svg"
            alt="햇반 타임밥슐 로고"
            width={120}
            height={40}
            className="mx-auto"
          />
        </div>

        {/* 메인 콘텐츠 */}
        <div className="max-w-md mx-auto px-4 py-8">
          {/* 메인 일러스트 영역 */}
          <div className="relative aspect-square mb-8">
            <Image
              src="/images/main.png"
              alt="타임밥슐 메인 이미지"
              fill
              className="object-contain"
              priority
            />
          </div>

          {/* 시작하기 버튼 */}
          <div className="flex justify-center mb-4">
            <Button
              onClick={handleCreateCapsule}
              className="w-[300px] rounded-full bg-white hover:bg-gray-50 text-gray-900 border-3 border-pink-100 py-8"
            >
              <span className="text-3xl mr-3">💌</span>
              <span style={{ fontFamily: 'omyu_pretty' }} className="text-3xl">타임밥슐 만들기</span>
            </Button>
          </div>

          {/* 참여자 수 */}
          {userCount > 0 && (
            <p className="text-center text-gray-600 text-sm">
              지금까지 <span className="font-bold text-cream-900">{userCount.toLocaleString()}</span>명이 추억을 저장했어요
            </p>
          )}

          {/* 공유하기 버튼들 */}
          <div className="flex justify-center gap-4 mt-8">
            <div className="relative">
              <button 
                className="w-12 h-12 flex items-center justify-center rounded-full bg-[#FEE500] hover:bg-[#FDD700] transition-colors"
                aria-label="카카오톡으로 공유하기"
                onClick={shareKakao}
              >
                <RiKakaoTalkFill className="w-6 h-6 text-[#391B1B]" />
              </button>
            </div>
            
            <button 
              className="w-12 h-12 flex items-center justify-center rounded-full bg-black hover:bg-gray-800 transition-colors"
              aria-label="X(트위터)로 공유하기"
              onClick={shareTwitter}
            >
              <FaXTwitter className="w-6 h-6 text-white" />
            </button>
            
            <button 
              className="w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#FCAF45] text-white hover:opacity-90 transition-opacity"
              aria-label="인스타그램 공유"
              onClick={shareInstagram}
            >
              <FaInstagram className="w-6 h-6 text-white" />
            </button>

            <div className="relative">
              <button 
                className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                aria-label="링크 복사하기"
                onClick={copyLink}
              >
                <FiLink className="w-6 h-6 text-gray-600" />
              </button>
              {isLinkTooltip && (
                <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-3 py-1 rounded text-sm whitespace-nowrap">
                  링크가 복사되었습니다!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
