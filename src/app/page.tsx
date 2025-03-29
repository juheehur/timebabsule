'use client'

import Image from 'next/image'
import { Button } from '@/components/ui'
import { RiKakaoTalkFill } from 'react-icons/ri'
import { FaXTwitter, FaInstagram } from 'react-icons/fa6'
import { FiLink } from 'react-icons/fi'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { BsFillStarFill } from 'react-icons/bs'

export default function Home() {
  const router = useRouter()
  const [userCount, setUserCount] = useState(0)
  const [isLinkTooltip, setIsLinkTooltip] = useState(false)
  const [stars, setStars] = useState<Array<{ left: number; top: number }>>([])

  useEffect(() => {
    // 별들의 위치를 클라이언트 사이드에서 생성
    setStars(
      [...Array(20)].map(() => ({
        left: Math.random() * 100,
        top: Math.random() * 100,
      }))
    )

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
    <main className="min-h-screen relative bg-[#760c0c] overflow-hidden">
      {/* 장식용 별들 */}
      {stars.map((position, i) => (
        <motion.div
          key={i}
          className="absolute"
          initial={{ opacity: 0.3 }}
          animate={{
            opacity: [0.3, 0.8, 0.3],
            scale: [1, 1.2, 1],
            y: [0, -10, 0]
          }}
          transition={{
            duration: Math.random() * 2 + 2,
            repeat: Infinity,
            delay: Math.random() * 2
          }}
          style={{
            left: `${position.left}%`,
            top: `${position.top}%`,
            color: '#FFD700'
          }}
        >
          <BsFillStarFill className="w-2 h-2" />
        </motion.div>
      ))}

      {/* 콘텐츠 레이어 */}
      <div className="relative z-10">
        {/* 상단 로고 */}
        <motion.div 
          className="w-full bg-white py-4 px-6 shadow-sm"
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ type: "spring", duration: 0.8 }}
        >
          <Image
            src="/images/logo.svg"
            alt="햇반 타임밥슐 로고"
            width={180}
            height={60}
            className="mx-auto"
          />
        </motion.div>

        {/* 메인 콘텐츠 */}
        <div className="max-w-2xl mx-auto px-4 py-8">
          {/* 메인 일러스트 영역 */}
          <motion.div 
            className="relative w-full max-w-[600px] aspect-square mb-2 mx-auto"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <Image
              src="/images/main.png"
              alt="타임밥슐 메인 이미지"
              fill
              className="object-contain"
              priority
            />
          </motion.div>

          {/* 시작하기 버튼 */}
          <motion.div 
            className="flex justify-center mb-4"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Button
              onClick={handleCreateCapsule}
              className="w-full max-w-[300px] rounded-full bg-white hover:bg-gray-50 text-gray-900 border-3 border-black-100 py-6 sm:py-8 hover:shadow-lg transition-all duration-300"
            >
              <motion.span 
                className="text-3xl mr-3"
                animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                💌
              </motion.span>
              <span style={{ fontFamily: 'omyu_pretty' }} className="text-3xl">타임밥슐 만들기</span>
            </Button>
          </motion.div>

          {/* 참여자 수 */}
          {userCount > 0 && (
            <motion.p 
              className="text-center text-white text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              지금까지 <span className="font-bold text-yellow-300">{userCount.toLocaleString()}</span>명이 추억을 저장했어요
            </motion.p>
          )}

          {/* 공유하기 버튼들 */}
          <motion.div 
            className="flex justify-center gap-4 mt-8"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="w-12 h-12 flex items-center justify-center rounded-full bg-[#FEE500] hover:bg-[#FDD700] transition-colors"
              aria-label="카카오톡으로 공유하기"
              onClick={shareKakao}
            >
              <RiKakaoTalkFill className="w-6 h-6 text-[#391B1B]" />
            </motion.button>
            
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="w-12 h-12 flex items-center justify-center rounded-full bg-black hover:bg-gray-800 transition-colors"
              aria-label="X(트위터)로 공유하기"
              onClick={shareTwitter}
            >
              <FaXTwitter className="w-6 h-6 text-white" />
            </motion.button>
            
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#FCAF45] text-white hover:opacity-90 transition-opacity"
              aria-label="인스타그램 공유"
              onClick={shareInstagram}
            >
              <FaInstagram className="w-6 h-6 text-white" />
            </motion.button>

            <div className="relative">
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                aria-label="링크 복사하기"
                onClick={copyLink}
              >
                <FiLink className="w-6 h-6 text-gray-600" />
              </motion.button>
              {isLinkTooltip && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-3 py-1 rounded text-sm whitespace-nowrap"
                >
                  링크가 복사되었습니다!
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  )
}
