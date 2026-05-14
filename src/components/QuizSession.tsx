import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
	Loader2,
	ArrowRight,
	SkipForward,
	CheckCircle2,
	ChevronRight,
	Image as ImageIcon,
} from 'lucide-react'
import { appwriteService } from '../services/appwriteService'
import { Question, Quiz } from '../types'
import { useAuth } from '../hooks/useAuth'
import { cn } from '../lib/utils'

interface QuizSessionProps {
	quizId: string
	onComplete: () => void
}

export function QuizSession({ quizId, onComplete }: QuizSessionProps) {
	const { user } = useAuth()
	const [quiz, setQuiz] = useState<Quiz | null>(null)
	const [questions, setQuestions] = useState<Question[]>([])
	const [currentQueue, setCurrentQueue] = useState<Question[]>([])
	const [skipQueue, setSkipQueue] = useState<Question[]>([])
	const [answers, setAnswers] = useState<any[]>([])
	const [loading, setLoading] = useState(true)
	const [selectedOption, setSelectedOption] = useState<number | null>(null)
	const [saving, setSaving] = useState(false)

	useEffect(() => {
		async function loadData() {
			try {
				const quizzes = await appwriteService.getQuizzes()
				const found = quizzes.find(q => q.$id === quizId)
				setQuiz(found || null)

				const fetched = await appwriteService.getQuestions(quizId)
				setQuestions(fetched)
				setCurrentQueue(fetched)
			} catch (err) {
				console.error(err)
			} finally {
				setLoading(false)
			}
		}
		loadData()
	}, [quizId])

	const currentQuestion = currentQueue[0]

	const handleNext = () => {
		if (selectedOption === null) return

		const isCorrect = selectedOption === currentQuestion.correctAnswer
		setAnswers([
			...answers,
			{
				questionId: currentQuestion.$id,
				selectedOption,
				isCorrect,
			},
		])

		const nextQueue = currentQueue.slice(1)

		if (nextQueue.length === 0 && skipQueue.length > 0) {
			setCurrentQueue(skipQueue)
			setSkipQueue([])
		} else if (nextQueue.length === 0 && skipQueue.length === 0) {
			finishQuiz([
				...answers,
				{
					questionId: currentQuestion.$id,
					selectedOption,
					isCorrect,
				},
			])
		} else {
			setCurrentQueue(nextQueue)
		}

		setSelectedOption(null)
	}

	const handleSkip = () => {
		const nextQueue = currentQueue.slice(1)
		const newSkipQueue = [...skipQueue, currentQuestion]

		if (nextQueue.length === 0) {
			setCurrentQueue(newSkipQueue)
			setSkipQueue([])
		} else {
			setCurrentQueue(nextQueue)
			setSkipQueue(newSkipQueue)
		}

		setSelectedOption(null)
	}

	const finishQuiz = async (finalAnswers: any[]) => {
		setSaving(true)
		const correctCount = finalAnswers.filter(a => a.isCorrect).length
		const score = Math.round((correctCount / questions.length) * 100)
		try {
			await appwriteService.saveResult({
				userId: user!.$id,
				userName: `${user!.name} ${user!.surname}`,
				quizId,
				quizTitle: quiz?.title || 'Unknown Quiz',
				score,
				totalQuestions: questions.length,
				answers: JSON.stringify(finalAnswers),
				completedAt: new Date().toISOString(),
			})
			onComplete()
		} catch (err) {
			console.error(err)
		} finally {
			setSaving(false)
		}
	}

	if (loading)
		return (
			<div className='h-[calc(100vh-64px)] flex items-center justify-center'>
				<Loader2 className='w-8 h-8 animate-spin' />
			</div>
		)

	if (!currentQuestion) return null

	const getOptions = (q: Question): string[] => {
		try {
			return typeof q.options === 'string'
				? JSON.parse(q.options)
				: (q.options as any)
		} catch {
			return []
		}
	}

	const progress =
		((questions.length -
			(currentQueue.length + skipQueue.length) +
			(selectedOption !== null ? 1 : 0)) /
			questions.length) *
		100

	return (
		<div className='max-w-7xl mx-auto p-4 md:p-8 pt-12'>
			<div className='grid grid-cols-12 gap-6 items-start'>
				{/* Sidebar: Details & Progress */}
				<div className='col-span-12 lg:col-span-3 space-y-6'>
					<div className='bento-card p-6 flex flex-col gap-6'>
						<div>
							<h3 className='text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3'>
								Sessiya profili
							</h3>
							<div className='space-y-4'>
								<div>
									<p className='text-[10px] font-black uppercase text-gray-400'>
										Imtihon topshiruvchi
									</p>
									<p className='text-sm font-black italic'>
										{user?.name} {user?.surname}
									</p>
								</div>
								<div>
									<p className='text-[10px] font-black uppercase text-gray-400'>
										Filial
									</p>
									<p className='text-sm font-black uppercase italic'>
										{user?.branch}
									</p>
								</div>
							</div>
						</div>

						<div className='border-t-2 border-dashed border-gray-100 pt-6'>
							<h3 className='text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3'>
								O'tkazib yuborilganlar
							</h3>
							<div className='flex flex-wrap gap-2'>
								{skipQueue.map((_, i) => (
									<div
										key={i}
										className='w-8 h-8 rounded-lg border-2 border-black bg-orange-400 flex items-center justify-center font-black text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
									>
										{questions.indexOf(skipQueue[i]) + 1}
									</div>
								))}
								{skipQueue.length === 0 && (
									<span className='text-[10px] italic text-gray-300'>
										Bo'sh
									</span>
								)}
							</div>
						</div>

						<div className='mt-auto pt-6 border-t-2 border-dashed border-gray-100'>
							<div className='flex justify-between items-end mb-2'>
								<span className='text-[10px] font-black uppercase'>
									Jarayon holati
								</span>
								<span className='text-sm font-black'>
									{questions.length - (currentQueue.length + skipQueue.length)}{' '}
									/ {questions.length}
								</span>
							</div>
							<div className='w-full h-3 bg-gray-100 border-2 border-black rounded-full overflow-hidden'>
								<motion.div
									className='h-full bg-blue-600 border-r-2 border-black'
									initial={{ width: 0 }}
									animate={{ width: `${progress}%` }}
								/>
							</div>
						</div>
					</div>

					<div className='bento-card bg-black p-6 text-white overflow-hidden'>
						<div className='flex items-center justify-between mb-4'>
							<h3 className='text-[10px] font-black uppercase tracking-tighter text-blue-400'>
								Jonli holat
							</h3>
							<span className='w-2 h-2 rounded-full bg-green-500 animate-pulse'></span>
						</div>
						<p className='text-xs font-medium leading-relaxed opacity-80 italic'>
							Hozirda #
							{questions.length - (currentQueue.length + skipQueue.length) + 1}
							-shart ko'rilmoqda. Tizim holati: Faol.
						</p>
					</div>
				</div>

				{/* Main Test Area */}
				<div className='col-span-12 lg:col-span-9 bento-card p-8 flex flex-col min-h-[600px]'>
					<div className='mb-8 flex justify-between items-center'>
						<span className='bg-black text-white px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] shadow-[4px_4px_0px_0px_rgba(37,99,235,0.4)]'>
							Savol ID: {currentQuestion.$id.slice(0, 4)}
						</span>
						<div className='flex items-center gap-4'>
							<span className='text-[10px] text-gray-400 font-bold uppercase tracking-widest italic'>
								Fan: {quiz?.subject}
							</span>
							<div className='h-4 w-[2px] bg-black/10'></div>
							<span className='text-[10px] text-red-500 font-black uppercase tracking-widest animate-pulse'>
								Sessiya FAOL
							</span>
						</div>
					</div>

					<div className='flex-grow flex flex-col'>
						<h2 className='text-3xl font-black italic tracking-tight text-black mb-10 leading-[1.1]'>
							{currentQuestion.text}
						</h2>

						{currentQuestion.imageUrl && (
							<div className='w-full bg-gray-50 border-2 border-black border-dashed rounded-xl flex items-center justify-center mb-10 overflow-hidden group'>
								<img
									src={currentQuestion.imageUrl}
									alt='Visual aid'
									className='w-full h-auto object-contain'
									referrerPolicy='no-referrer'
								/>
							</div>
						)}

						<div className='grid md:grid-cols-2 gap-4'>
							{getOptions(currentQuestion).map(
								(option: string, idx: number) => (
									<button
										key={idx}
										onClick={() => setSelectedOption(idx)}
										className={cn(
											'p-6 border-2 rounded-2xl text-left transition-all group relative overflow-hidden flex items-center gap-4',
											selectedOption === idx
												? 'bg-blue-600 text-white border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] translate-x-[-2px] translate-y-[-2px]'
												: 'bg-white border-black hover:bg-blue-50/50',
										)}
									>
										<span
											className={cn(
												'absolute top-0 left-0 text-[10px] px-2 py-0.5 font-bold uppercase border-b-2 border-r-2 border-black',
												selectedOption === idx
													? 'bg-white text-black'
													: 'bg-black text-white',
											)}
										>
											{String.fromCharCode(65 + idx)}
										</span>
										<span className='block font-black text-sm'>{option}</span>
									</button>
								),
							)}
						</div>
					</div>

					<div className='mt-12 flex gap-4'>
						<button
							onClick={handleSkip}
							disabled={saving}
							className='flex-1 h-16 bento-button bg-orange-400 flex items-center justify-center gap-3'
						>
							<span className='hidden md:inline'>O'tkazib yuborish</span>
							<span className='md:hidden'>Skip</span>
							<SkipForward className='w-5 h-5' />
						</button>
						<button
							onClick={handleNext}
							disabled={selectedOption === null || saving}
							className={cn(
								'flex-[2] h-16 bento-button flex items-center justify-center gap-3',
								selectedOption === null
									? 'bg-gray-100 text-gray-400 border-gray-300 shadow-none'
									: 'bg-green-500 text-white',
							)}
						>
							{saving ? (
								<Loader2 className='w-6 h-6 animate-spin' />
							) : (
								<>
									<span className='hidden md:inline'>Javobni tasdiqlash</span>
									<span className='md:hidden'>Tasdiqlash</span>
									<ChevronRight className='w-6 h-6' />
								</>
							)}
						</button>
					</div>
				</div>
			</div>
		</div>
	)
}
