'use client'

import { Card } from '@/components/ui'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [capsules, setCapsules] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // 디버깅용 - 6년 후로 날짜 설정
  const setTimeTo6YearsLater = () => {
    const currentDate = new Date()
    const sixYearsLater = new Date(currentDate)
    sixYearsLater.setFullYear(currentDate.getFullYear() + 6)
    
    // 로컬 스토리지에 가상 날짜 설정
    localStorage.setItem('debugDate', sixYearsLater.toISOString())
    alert(`디버깅 모드: 날짜가 6년 후(${formatDate(sixYearsLater.toISOString())})로 설정되었습니다. 페이지를 새로고침하세요.`)
    
    // 페이지 새로고침
    window.location.reload()
  }

  // 디버깅용 - 날짜 초기화
  const resetDebugDate = () => {
    localStorage.removeItem('debugDate')
    alert('디버깅 모드: 날짜가 현재로 초기화되었습니다. 페이지를 새로고침하세요.')
    
    // 페이지 새로고침
    window.location.reload()
  }

  // 디버깅 모드 여부 확인
  const isDebugMode = () => {
    return !!localStorage.getItem('debugDate')
  }

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      router.push('/')
    } catch (error) {
      console.error('로그아웃 오류:', error)
    }
  }

  const fetchCapsules = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }
      
      setUser(session.user)

      const { data: capsules, error } = await supabase
        .from('time_capsules')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setCapsules(capsules || [])
    } catch (error) {
      console.error('타임캡슐 목록 조회 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCapsules()
  }, [router])

  const handleDeleteCapsule = async (e: React.MouseEvent, capsuleId: string, imageUrl: string) => {
    e.stopPropagation() // 이벤트 버블링 방지
    
    if (!window.confirm('정말로 이 타임밥슐을 삭제하시겠습니까?')) {
      return
    }

    try {
      setLoading(true)

      // 현재 사용자 세션 확인
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }

      // UI 먼저 업데이트 (낙관적 업데이트)
      setCapsules(prevCapsules => 
        prevCapsules.filter(capsule => capsule.id !== capsuleId)
      )

      // 1. 데이터베이스에서 캡슐 삭제
      const { error: dbError } = await supabase
        .from('time_capsules')
        .delete()
        .eq('id', capsuleId)

      if (dbError) {
        console.error('타임캡슐 삭제 오류:', dbError)
        // 에러 발생 시 UI 롤백
        await fetchCapsules()
        throw dbError
      }

      // 2. Storage에서 이미지 파일 삭제 시도
      if (imageUrl) {
        try {
          // URL에서 파일 이름 추출
          const urlParts = imageUrl.split('capsule-images/')
          if (urlParts.length > 1) {
            const filePath = urlParts[1] // user_id/filename.jpg
            console.log('삭제할 이미지 경로:', filePath)
            
            await supabase.storage
              .from('capsule-images')
              .remove([filePath])
          }
        } catch (imageError) {
          console.error('이미지 삭제 중 오류:', imageError)
          // 이미지 삭제 실패는 무시
        }
      }
      
      // 3. 백그라운드에서 목록 새로고침 (1초 후)
      setTimeout(() => {
        fetchCapsules().catch(error => {
          console.error('캡슐 목록 새로고침 오류:', error)
        })
      }, 1000)

    } catch (error) {
      console.error('삭제 중 오류 발생:', error)
      alert('삭제 중 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white py-8 px-6">
        <div className="max-w-xl mx-auto flex justify-center items-center min-h-[50vh]">
          <div className="w-8 h-8 border-4 border-pink-200 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white py-8 px-6 md:py-12 md:px-8">
      <div className="max-w-xl mx-auto">
        <div className="flex flex-col gap-6 mb-8">
          <div className="flex justify-between items-center">
            <h1 
              className="text-2xl md:text-3xl font-bold text-gray-900"
              style={{ fontFamily: 'omyu_pretty' }}
            >
              내 타임밥슐 ({capsules.length})
            </h1>
            <div className="flex gap-2">
              {/* 디버깅 버튼 - 특정 이메일에만 표시 */}
              {user?.email === 'emily.hur.juhee@gmail.com' && (
                isDebugMode() ? (
                  <button
                    onClick={resetDebugDate}
                    className="text-white bg-red-500 hover:bg-red-600 px-3 py-2 rounded-full text-xs transition-colors"
                  >
                    🕒 현재 날짜로 복원
                  </button>
                ) : (
                  <button
                    onClick={setTimeTo6YearsLater}
                    className="text-white bg-violet-500 hover:bg-violet-600 px-3 py-2 rounded-full text-xs transition-colors"
                  >
                    🔮 디버깅: 6년 후로
                  </button>
                )
              )}
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-900 px-4 py-2 rounded-full border border-gray-200 hover:border-gray-300 transition-colors text-sm"
              >
                로그아웃
              </button>
            </div>
          </div>
          
          <button
            onClick={() => router.push('/create-capsule')}
            disabled={capsules.length >= 3}
            className={`w-full py-4 rounded-full flex items-center justify-center transition-colors ${
              capsules.length >= 3 
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                : 'bg-pink-500 text-white hover:bg-pink-600'
            }`}
          >
            <span className="mr-2">💌</span>
            <span className="font-medium">
              {capsules.length >= 3 
                ? '타임밥슐은 최대 3개까지 생성 가능합니다' 
                : '새로운 타임밥슐 만들기'}
            </span>
          </button>
        </div>

        {capsules.length === 0 ? (
          <div className="text-center py-16 bg-pink-50/50 rounded-xl">
            <p className="text-gray-600 mb-4 text-lg">아직 만든 타임밥슐이 없어요</p>
            <p className="text-gray-500">
              소중한 추억을 담아 미래의 나에게 선물해보세요
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {capsules.map((capsule) => (
              <Card 
                key={capsule.id} 
                className="relative overflow-hidden shadow-sm transition-all duration-300 border border-gray-100 rounded-xl"
              >
                <div
                  onClick={() => router.push(`/capsule/${capsule.id}`)}
                  className="cursor-pointer"
                >
                  <div className="relative w-full aspect-video bg-gray-100 overflow-hidden">
                    <Image
                      src={capsule.image_url}
                      alt={capsule.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h2 
                        className="text-xl font-medium text-gray-900"
                        style={{ fontFamily: capsule.font_family || 'omyu_pretty' }}
                      >
                        {capsule.title}
                      </h2>
                      <button
                        onClick={(e) => handleDeleteCapsule(e, capsule.id, capsule.image_url)}
                        className="ml-2 flex-shrink-0 bg-white border border-pink-200 text-gray-900 px-3 py-1 rounded-full text-sm hover:bg-pink-50 shadow-sm"
                      >
                        삭제
                      </button>
                    </div>
                    <div className="text-sm text-gray-500">
                      <p className="mb-1">봉인된 날짜: {formatDate(capsule.created_at)}</p>
                      <p className="text-pink-500 font-medium">개봉 예정일: {formatDate(capsule.open_date)}</p>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 