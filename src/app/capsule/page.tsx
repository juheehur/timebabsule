'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'

export default function CreateCapsulePage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const imageRef = useRef<HTMLInputElement>(null)
  const [title, setTitle] = useState('5년 뒤의 나에게...')
  const [content, setContent] = useState('')
  const [openDate, setOpenDate] = useState('')
  const [fontFamily, setFontFamily] = useState('omyu_pretty')
  const [step, setStep] = useState(1)

  // 날짜 관련 유틸리티 함수들
  const getDefaultDate = () => {
    const date = new Date()
    date.setFullYear(date.getFullYear() + 5)
    return date.toISOString().split('T')[0]
  }

  const getOneYearLater = () => {
    const date = new Date()
    date.setFullYear(date.getFullYear() + 1)
    return date.toISOString().split('T')[0]
  }

  const getNextChristmas = () => {
    const date = new Date()
    const currentYear = date.getFullYear()
    const christmas = new Date(currentYear, 11, 25) // 12월 25일
    if (date > christmas) {
      christmas.setFullYear(currentYear + 1)
    }
    return christmas.toISOString().split('T')[0]
  }

  const getNextNewYear = () => {
    const date = new Date()
    const currentYear = date.getFullYear()
    const newYear = new Date(currentYear + 1, 0, 1) // 1월 1일
    return newYear.toISOString().split('T')[0]
  }

  // 초기 개봉일 설정
  useEffect(() => {
    setOpenDate(getDefaultDate())
  }, [])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }

      // 현재 사용자의 타임밥슐 개수 확인
      const { count } = await supabase
        .from('time_capsules')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', session.user.id)

      if (count && count >= 3) {
        alert('타임밥슐은 최대 3개까지만 만들 수 있습니다.')
        setIsSubmitting(false)
        return
      }

      // 이미지 업로드
      const imageFile = imageRef.current?.files?.[0]
      if (!imageFile) {
        alert('이미지를 선택해주세요.')
        setIsSubmitting(false)
        return
      }

      const fileExt = imageFile.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `${session.user.id}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('capsule-images')
        .upload(filePath, imageFile)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('capsule-images')
        .getPublicUrl(filePath)

      // 타임밥슐 생성
      const { error: insertError } = await supabase
        .from('time_capsules')
        .insert({
          user_id: session.user.id,
          title,
          letter_content: content,
          open_date: openDate,
          image_url: publicUrl,
          font_family: fontFamily
        })

      if (insertError) throw insertError

      router.push('/dashboard')
    } catch (error) {
      console.error('타임밥슐 생성 오류:', error)
      alert('타임밥슐 생성 중 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-white py-12 px-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <span>←</span>
            <span>돌아가기</span>
          </button>
          </div>

        {/* 진행 상태 표시 */}
        <div className="mb-12">
          <h1 className="text-2xl font-bold text-center mb-8">타임밥슐 만들기</h1>
          <div className="flex items-center justify-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              step >= 1 ? 'bg-pink-500 text-white' : 'bg-gray-200'
            }`}>
              1
            </div>
            <div className={`w-20 h-1 ${step >= 2 ? 'bg-pink-500' : 'bg-gray-200'}`} />
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              step >= 2 ? 'bg-pink-500 text-white' : 'bg-gray-200'
            }`}>
              2
            </div>
            <div className={`w-20 h-1 ${step >= 3 ? 'bg-pink-500' : 'bg-gray-200'}`} />
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              step >= 3 ? 'bg-pink-500 text-white' : 'bg-gray-200'
            }`}>
              3
            </div>
          </div>
          <div className="text-center mt-4 text-gray-600">
            {step === 1 && '확인 및 봉인하기'}
            {step === 2 && '타임밥슐 작성하기'}
            {step === 3 && '개봉일 설정하기'}
            </div>
          </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {step === 1 && (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-xl font-medium mb-4">타임밥슐 내용을 확인하고 봉인해주세요</h2>
                <p className="text-gray-600">5년 후에 열람할 수 있습니다.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이미지 선택
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                  <div className="space-y-1 text-center">
                    {previewUrl ? (
                      <div className="relative w-full aspect-video">
                        <Image
                          src={previewUrl}
                          alt="Preview"
                          fill
                          className="object-cover rounded-lg"
                        />
                      </div>
                    ) : (
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                        aria-hidden="true"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="image-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-pink-600 hover:text-pink-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-pink-500"
                      >
                        <span>이미지 업로드</span>
                        <input
                          id="image-upload"
                          name="image-upload"
                          type="file"
                          className="sr-only"
                          accept="image/*"
                          onChange={handleImageChange}
                          ref={imageRef}
                        />
                      </label>
                      <p className="pl-1">또는 드래그 앤 드롭</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF 최대 10MB
                    </p>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full bg-pink-500 text-white py-3 px-4 rounded-lg hover:bg-pink-600 transition-colors"
              >
                다음 단계
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-xl font-medium mb-4">타임밥슐 내용을 작성해주세요</h2>
                <p className="text-gray-600">미래의 나에게 보내는 메시지를 작성해주세요.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  제목
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="예) 5년 뒤의 나에게..., 미래의 나에게 보내는 편지"
                  required
                />
                <p className="mt-1 text-sm text-gray-500">
                  미래의 나에게 보내는 편지의 제목을 입력해주세요
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  내용
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent h-48"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  폰트 선택
                </label>
                <select
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  <option value="omyu_pretty">오뮤 다예쁘게</option>
                  <option value="NanumMyeongjo">나눔명조</option>
                  <option value="NanumGothic">나눔고딕</option>
                  <option value="NanumPenScript">나눔펜스크립트</option>
                </select>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full bg-gray-100 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  이전 단계
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="w-full bg-pink-500 text-white py-3 px-4 rounded-lg hover:bg-pink-600 transition-colors"
                >
                  다음 단계
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-xl font-medium mb-4">타임밥슐 개봉일을 선택해주세요</h2>
                <p className="text-gray-600">선택한 날짜에 타임밥슐을 열어볼 수 있습니다.</p>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setOpenDate(getDefaultDate())}
                    className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                      openDate === getDefaultDate()
                        ? 'border-pink-500 bg-pink-50 text-pink-700'
                        : 'border-gray-200 hover:border-pink-200'
                    }`}
                  >
                    5년 뒤
                  </button>
                  <button
                    type="button"
                    onClick={() => setOpenDate(getOneYearLater())}
                    className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                      openDate === getOneYearLater()
                        ? 'border-pink-500 bg-pink-50 text-pink-700'
                        : 'border-gray-200 hover:border-pink-200'
                    }`}
                  >
                    1년 뒤
                  </button>
                  <button
                    type="button"
                    onClick={() => setOpenDate(getNextChristmas())}
                    className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                      openDate === getNextChristmas()
                        ? 'border-pink-500 bg-pink-50 text-pink-700'
                        : 'border-gray-200 hover:border-pink-200'
                    }`}
                  >
                    다음 크리스마스
                  </button>
                  <button
                    type="button"
                    onClick={() => setOpenDate(getNextNewYear())}
                    className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                      openDate === getNextNewYear()
                        ? 'border-pink-500 bg-pink-50 text-pink-700'
                        : 'border-gray-200 hover:border-pink-200'
                    }`}
                  >
                    내년 1월 1일
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="date"
                    value={openDate}
                    onChange={(e) => setOpenDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    직접 선택
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full bg-gray-100 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  이전 단계
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-pink-500 text-white py-3 px-4 rounded-lg hover:bg-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? '생성 중...' : '타임밥슐 봉인하기'}
                </button>
              </div>
          </div>
          )}
        </form>
      </div>
    </div>
  )
} 