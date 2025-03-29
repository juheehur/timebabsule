'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

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
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  // fonts 배열을 useMemo로 감싸기
  const fonts = useMemo(() => [
    { name: 'GangwonEduSaeeum_OTFMediumA', label: '강원교육새음체' },
    { name: 'ANDONG264TTF', label: '안동엄마까투리체' },
    { name: 'KyoboHand', label: '교보손글씨체' },
    { name: 'iceJaram-Rg', label: '아이스자람체' },
    { name: 'YoonChildfundkoreaManSeh', label: '아동복지보호체' },
    { name: 'omyu_pretty', label: '오뮤 예쁨체' }
  ], [])

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

  // 초기 폰트 설정
  useEffect(() => {
    // 랜덤으로 초기 폰트 선택
    const randomFont = fonts[Math.floor(Math.random() * fonts.length)]
    setFontFamily(randomFont.name)
  }, [fonts])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      console.log('파일 선택됨:', file.name, file.type, file.size);
      
      if (file.size > 10 * 1024 * 1024) { // 10MB 제한
        alert('이미지 크기는 10MB를 초과할 수 없습니다.')
        return
      }
      
      if (!file.type.startsWith('image/')) {
        alert('이미지 파일만 업로드할 수 있습니다.')
        return
      }

      setSelectedFile(file)
      
      // 간단한 방식으로 변경 - FileReader로 바로 URL 설정
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string;
        console.log('이미지 로드 완료 - URL 시작 부분:', result.substring(0, 50) + '...');
        setPreviewUrl(result);
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const file = e.dataTransfer.files?.[0]
    if (file) {
      console.log('드래그 앤 드롭으로 파일 선택됨:', file.name, file.type, file.size);
      
      if (file.size > 10 * 1024 * 1024) {
        alert('이미지 크기는 10MB를 초과할 수 없습니다.')
        return
      }
      
      if (!file.type.startsWith('image/')) {
        alert('이미지 파일만 업로드할 수 있습니다.')
        return
      }

      setSelectedFile(file)
      
      // 간단한 방식으로 변경
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string;
        console.log('이미지 로드 완료 - URL 시작 부분:', result.substring(0, 50) + '...');
        setPreviewUrl(result);
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
      if (!selectedFile) {
        alert('이미지를 선택해주세요.')
        setIsSubmitting(false)
        return
      }

      const fileExt = selectedFile.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `${session.user.id}/${fileName}`

      console.log('이미지 업로드 시도:', filePath)

      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('capsule-images')
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          contentType: selectedFile.type,
          upsert: true
        })

      if (uploadError) {
        console.error('이미지 업로드 오류:', uploadError)
        throw new Error(`이미지 업로드 실패: ${uploadError.message}`)
      }

      if (!uploadData || !uploadData.path) {
        throw new Error('이미지 경로를 가져올 수 없습니다.')
      }

      const { data: { publicUrl } } = supabase.storage
        .from('capsule-images')
        .getPublicUrl(filePath)

      console.log('이미지 URL:', publicUrl)

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

      if (insertError) {
        console.error('타임밥슐 생성 오류:', insertError)
        throw new Error(`타임밥슐 생성 실패: ${insertError.message}`)
      }

      router.push('/dashboard')
    } catch (error) {
      console.error('타임밥슐 생성 오류:', error)
      alert(`타임밥슐 생성 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`)
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
              step >= 1 ? 'bg-[#b52a26] text-white' : 'bg-gray-200'
            }`}>
              1
            </div>
            <div className={`w-20 h-1 ${step >= 2 ? 'bg-[#b52a26]' : 'bg-gray-200'}`} />
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              step >= 2 ? 'bg-[#b52a26] text-white' : 'bg-gray-200'
            }`}>
              2
            </div>
            <div className={`w-20 h-1 ${step >= 3 ? 'bg-[#b52a26]' : 'bg-gray-200'}`} />
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              step >= 3 ? 'bg-[#b52a26] text-white' : 'bg-gray-200'
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
                <h2 className="text-xl font-medium mb-4">타임밥슐에 넣을 사진을 선택해주세요</h2>
                <p className="text-gray-600">사진은 타임밥슐이 열릴때 볼 수 있어요!</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이미지 선택
                </label>
                <div 
                  className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  <div className="space-y-1 text-center">
                    {previewUrl ? (
                      <div className="relative" onClick={() => imageRef.current?.click()}>
                        <img 
                          src={previewUrl} 
                          alt="업로드 이미지 미리보기" 
                          className="w-full h-64 object-contain rounded-lg border border-gray-300"
                        />
                        <div className="absolute top-2 right-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewUrl(null);
                              setSelectedFile(null);
                            }}
                            className="bg-white rounded-full p-1.5 shadow-md hover:bg-gray-100"
                          >
                            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        
                        {/* 디버깅용 정보 */}
                        <div className="mt-2 text-xs text-gray-500 text-center">
                          이미지 URL 길이: {previewUrl.length} 문자
                        </div>
                      </div>
                    ) : (
                      <div 
                        className="flex flex-col items-center cursor-pointer py-6 px-4 hover:bg-gray-50 transition-colors rounded-lg"
                        onClick={() => imageRef.current?.click()}
                      >
                        <svg
                          className="mx-auto h-12 w-12 text-gray-400 mb-3"
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
                        <div className="flex text-sm text-gray-600">
                          <label
                            htmlFor="image-upload"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-[#b52a26] hover:text-[#a02522] focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[#b52a26]"
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
                        <p className="text-xs text-gray-500 mt-2">
                          PNG, JPG, GIF 최대 10MB
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full bg-[#b52a26] text-white py-3 px-4 rounded-lg hover:bg-[#a02522] transition-colors"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent h-48"
                  style={{ fontFamily: fontFamily }}
                  placeholder="미래의 나에게 전하고 싶은 이야기를 적어보세요..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  폰트 선택
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {fonts.map((font) => (
                    <button
                      key={font.name}
                      type="button"
                      onClick={() => setFontFamily(font.name)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        fontFamily === font.name
                          ? 'border-[#b52a26] bg-[#f8e9e9]'
                          : 'border-gray-200 hover:border-[#b52a26]'
                      }`}
                    >
                      <p style={{ fontFamily: font.name }} className="text-2xl mb-2">
                        안녕하세요
                      </p>
                      <p className="text-sm text-gray-500">{font.label}</p>
                    </button>
                  ))}
                </div>
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
                  className="w-full bg-[#b52a26] text-white py-3 px-4 rounded-lg hover:bg-[#a02522] transition-colors"
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
                        ? 'border-[#b52a26] bg-[#f8e9e9] text-[#b52a26]'
                        : 'border-gray-200 hover:border-[#b52a26]'
                    }`}
                  >
                    5년 뒤
                  </button>
                  <button
                    type="button"
                    onClick={() => setOpenDate(getOneYearLater())}
                    className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                      openDate === getOneYearLater()
                        ? 'border-[#b52a26] bg-[#f8e9e9] text-[#b52a26]'
                        : 'border-gray-200 hover:border-[#b52a26]'
                    }`}
                  >
                    1년 뒤
                  </button>
                  <button
                    type="button"
                    onClick={() => setOpenDate(getNextChristmas())}
                    className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                      openDate === getNextChristmas()
                        ? 'border-[#b52a26] bg-[#f8e9e9] text-[#b52a26]'
                        : 'border-gray-200 hover:border-[#b52a26]'
                    }`}
                  >
                    다음 크리스마스
                  </button>
                  <button
                    type="button"
                    onClick={() => setOpenDate(getNextNewYear())}
                    className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                      openDate === getNextNewYear()
                        ? 'border-[#b52a26] bg-[#f8e9e9] text-[#b52a26]'
                        : 'border-gray-200 hover:border-[#b52a26]'
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#b52a26] focus:border-transparent cursor-pointer"
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
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
                  className="w-full bg-[#b52a26] text-white py-3 px-4 rounded-lg hover:bg-[#a02522] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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