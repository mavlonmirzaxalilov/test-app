import React, { useState, useEffect } from 'react'
import { appwriteService } from '../services/appwriteService'
import { Quiz, Question } from '../types'
import {
	Loader2,
	Plus,
	Trash2,
	Edit2,
	ChevronRight,
	X,
	Image as ImageIcon,
	Save,
	CheckCircle2,
} from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { cn } from '../lib/utils'

export function AdminQuizzes() {
	const [quizzes, setQuizzes] = useState<Quiz[]>([])
	const [loading, setLoading] = useState(true)
	const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null)
	const [editingQuestions, setEditingQuestions] = useState<Question[]>([])
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false)
	const [currentQuizId, setCurrentQuizId] = useState<string | null>(null)

	useEffect(() => {
		fetchQuizzes()
	}, [])

	const fetchQuizzes = async () => {
		try {
			const data = await appwriteService.getQuizzes()
			setQuizzes(data)
		} catch (err) {
			console.error(err)
		} finally {
			setLoading(false)
		}
	}

	const handleEditQuiz = async (quiz: Quiz) => {
		setEditingQuiz(quiz)
		setIsModalOpen(true)
	}

	const handleManageQuestions = async (quizId: string) => {
		setCurrentQuizId(quizId)
		setLoading(true)
		try {
			const qs = await appwriteService.getQuestions(quizId)
			setEditingQuestions(qs)
			setIsQuestionModalOpen(true)
		} catch (err) {
			console.error(err)
		} finally {
			setLoading(false)
		}
	}

	const handleDeleteQuiz = async (id: string) => {
		if (!confirm('Destroy this record and all associated data?')) return
		await appwriteService.deleteQuiz(id)
		setQuizzes(quizzes.filter(q => q.$id !== id))
	}

	if (loading && !isQuestionModalOpen && !isModalOpen)
		return (
			<div className='p-20 text-center'>
				<Loader2 className='w-8 h-8 animate-spin mx-auto opacity-20' />
			</div>
		)

	return (
		<div className='p-8 space-y-10 mt-10'>
			<div className='flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4 border-b-2 border-black/5'>
				<div>
					<h2 className='text-xs font-black uppercase tracking-[0.3em] text-gray-400 mb-2'>
						Kontentni boshqarish markazi
					</h2>
					<h1 className='text-5xl font-black italic tracking-tighter uppercase'>
						Ma'lumotlar <span className='text-blue-600'>Arxitektori</span>
					</h1>
				</div>
				<button
					onClick={() => {
						setEditingQuiz(null)
						setIsModalOpen(true)
					}}
					className='bento-button bg-black text-white px-8 py-4 flex items-center gap-3 text-sm'
				>
					<Plus className='w-5 h-5' />
					Yangi test yaratish
				</button>
			</div>

			<div className='grid md:grid-cols-2 lg:grid-cols-3 gap-8'>
				{quizzes.map(quiz => (
					<div
						key={quiz.$id}
						className='bento-card bento-card-hover overflow-hidden flex flex-col cursor-default'
					>
						<div className='aspect-video bg-gray-50 border-b-2 border-black flex items-center justify-center relative group'>
							{quiz.imageUrl ? (
								<img
									src={quiz.imageUrl}
									alt=''
									className='w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700'
								/>
							) : (
								<ImageIcon className='w-12 h-12 opacity-10' />
							)}
							<div className='absolute top-3 right-3 flex gap-2'>
								<button
									onClick={() => handleEditQuiz(quiz)}
									className='w-10 h-10 bento-card bg-white flex items-center justify-center hover:bg-blue-50 text-blue-600 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none translate-y-0'
								>
									<Edit2 className='w-4 h-4' />
								</button>
								<button
									onClick={() => handleDeleteQuiz(quiz.$id)}
									className='w-10 h-10 bento-card bg-red-50 flex items-center justify-center hover:bg-red-500 hover:text-white text-red-600 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none translate-y-0'
								>
									<Trash2 className='w-4 h-4' />
								</button>
							</div>
						</div>
						<div className='p-6 flex-1 flex flex-col gap-6'>
							<div>
								<span className='text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-2 py-1 rounded border-2 border-blue-500/10 mb-3 inline-block'>
									{quiz.category} / {quiz.subject}
								</span>
								<h3 className='text-2xl font-black italic tracking-tight uppercase'>
									{quiz.title}
								</h3>
							</div>
							<button
								onClick={() => handleManageQuestions(quiz.$id)}
								className='w-full h-12 bento-button bg-white hover:bg-gray-50 flex items-center justify-center gap-3 text-[10px]'
							>
								Savollarni sozlash
								<ChevronRight className='w-4 h-4' />
							</button>
						</div>
					</div>
				))}
			</div>

			{/* Quiz Modal */}
			{isModalOpen && (
				<QuizFormModal
					quiz={editingQuiz}
					onClose={() => setIsModalOpen(false)}
					onSaved={() => {
						setIsModalOpen(false)
						fetchQuizzes()
					}}
				/>
			)}

			{/* Questions Modal */}
			{isQuestionModalOpen && (
				<QuestionsManagerModal
					quizId={currentQuizId!}
					onClose={() => setIsQuestionModalOpen(false)}
				/>
			)}
		</div>
	)
}

function QuizFormModal({
	quiz,
	onClose,
	onSaved,
}: {
	quiz: Quiz | null
	onClose: () => void
	onSaved: () => void
}) {
	const [data, setData] = useState({
		title: quiz?.title || '',
		description: quiz?.description || '',
		subject: quiz?.subject || '',
		category: quiz?.category || '',
		imageUrl: quiz?.imageUrl || '',
	})
	const [saving, setSaving] = useState(false)

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setSaving(true)
		try {
			if (quiz) {
				await appwriteService.updateQuiz(quiz.$id, data)
			} else {
				await appwriteService.createQuiz(data)
			}
			onSaved()
		} catch (err) {
			console.error(err)
		} finally {
			setSaving(false)
		}
	}

	return (
		<div className='fixed inset-0 bg-[#F4F7F5]/80 backdrop-blur-md z-[100] flex items-center justify-center p-6'>
			<motion.div
				initial={{ scale: 0.95, opacity: 0 }}
				animate={{ scale: 1, opacity: 1 }}
				className='bento-card w-full max-w-2xl p-10 bg-white'
			>
				<div className='flex justify-between items-center mb-10 border-b-2 border-dashed border-gray-100 pb-6'>
					<h2 className='text-3xl font-black italic tracking-tighter uppercase whitespace-nowrap'>
						{quiz ? 'Kursni tahrirlash' : 'Yangi test yaratish'}
					</h2>
					<button
						onClick={onClose}
						className='w-10 h-10 bento-card bg-white flex items-center justify-center hover:bg-red-50 text-red-600 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none'
					>
						<X className='w-6 h-6' />
					</button>
				</div>

				<form onSubmit={handleSubmit} className='space-y-6'>
					<div className='grid grid-cols-2 gap-6'>
						<div className='space-y-1'>
							<label className='text-[10px] font-black uppercase text-gray-400 px-1'>
								Nomi
							</label>
							<input
								required
								className='w-full p-4 border-2 border-black rounded-xl font-bold bg-gray-50 focus:bg-blue-50/30 transition-all focus:outline-none'
								value={data.title}
								onChange={e => setData({ ...data, title: e.target.value })}
							/>
						</div>
						<div className='space-y-1'>
							<label className='text-[10px] font-black uppercase text-gray-400 px-1'>
								Rasm URL manzili
							</label>
							<input
								className='w-full p-4 border-2 border-black rounded-xl font-bold bg-gray-50 focus:bg-blue-50/30 transition-all focus:outline-none'
								placeholder='https://...'
								value={data.imageUrl}
								onChange={e => setData({ ...data, imageUrl: e.target.value })}
							/>
						</div>
					</div>

					<div className='grid grid-cols-2 gap-6'>
						<div className='space-y-1'>
							<label className='text-[10px] font-black uppercase text-gray-400 px-1'>
								Fan sohasi
							</label>
							<input
								required
								className='w-full p-4 border-2 border-black rounded-xl font-bold bg-gray-50 focus:bg-blue-50/30 transition-all focus:outline-none'
								value={data.subject}
								onChange={e => setData({ ...data, subject: e.target.value })}
							/>
						</div>
						<div className='space-y-1'>
							<label className='text-[10px] font-black uppercase text-gray-400 px-1'>
								Toifa guruhi
							</label>
							<input
								required
								className='w-full p-4 border-2 border-black rounded-xl font-bold bg-gray-50 focus:bg-blue-50/30 transition-all focus:outline-none'
								value={data.category}
								onChange={e => setData({ ...data, category: e.target.value })}
							/>
						</div>
					</div>

					<div className='space-y-1'>
						<label className='text-[10px] font-black uppercase text-gray-400 px-1'>
							Tavsifi
						</label>
						<textarea
							required
							rows={3}
							className='w-full p-4 border-2 border-black rounded-xl font-bold bg-gray-50 focus:bg-blue-50/30 transition-all focus:outline-none resize-none'
							value={data.description}
							onChange={e => setData({ ...data, description: e.target.value })}
						/>
					</div>

					<button
						type='submit'
						disabled={saving}
						className='w-full h-15 bento-button bg-black text-white flex items-center justify-center gap-3 text-sm mt-4'
					>
						{saving ? (
							<Loader2 className='w-5 h-5 animate-spin' />
						) : (
							<>
								<Save className='w-5 h-5' />
								Ma'lumotlar bazasiga saqlash
							</>
						)}
					</button>
				</form>
			</motion.div>
		</div>
	)
}

function QuestionsManagerModal({
	quizId,
	onClose,
}: {
	quizId: string
	onClose: () => void
}) {
	const [questions, setQuestions] = useState<Question[]>([])
	const [loading, setLoading] = useState(true)
	const [newQ, setNewQ] = useState({
		text: '',
		imageUrl: '',
		options: ['', '', '', ''],
		correctAnswer: 0,
	})

	useEffect(() => {
		fetch()
	}, [quizId])

	const fetch = async () => {
		const data = await appwriteService.getQuestions(quizId)
		setQuestions(data)
		setLoading(false)
	}
	const handleDeleteQuestion = async (id: string) => {
		if (!confirm("Bu savolni o'chirmoqchimisiz?")) return
		await appwriteService.deleteQuestion(id)
		fetch()
	}

	const handleAdd = async (e: React.FormEvent) => {
		e.preventDefault()
		setLoading(true)
		try {
			await appwriteService.createQuestion({
				quizId,
				text: newQ.text,
				imageUrl: newQ.imageUrl,
				options: JSON.stringify(newQ.options),
				correctAnswer: newQ.correctAnswer,
			})
			setNewQ({
				text: '',
				imageUrl: '',
				options: ['', '', '', ''],
				correctAnswer: 0,
			})
			fetch()
		} catch (err) {
			console.error(err)
		}
	}

	return (
		<div className='fixed inset-0 bg-[#000]/90 backdrop-blur-xl z-[110] flex items-center justify-center p-6'>
			<div className='bento-card bg-white w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden border-none shadow-[8px_8px_0px_0px_rgba(37,99,235,0.4)]'>
				<div className='p-8 border-b-2 border-black flex justify-between items-center bg-[#F4F7F5]'>
					<div>
						<h2 className='text-3xl font-black italic tracking-tighter uppercase'>
							Mantiqiy birliklarni boshqarish
						</h2>
						<p className='text-[10px] font-black uppercase text-blue-600'>
							Kurs ID si uchun sozlash: {quizId}
						</p>
					</div>
					<button
						onClick={onClose}
						className='w-12 h-12 bento-card bg-white flex items-center justify-center hover:bg-black hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none'
					>
						<X size={24} />
					</button>
				</div>

				<div className='flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12'>
					{/* List Section */}
					<div className='lg:col-span-4 p-8 overflow-y-auto border-r-2 border-dashed border-gray-100 bg-gray-50/50 space-y-6'>
						<h3 className='text-[10px] font-black uppercase text-gray-400 border-b-2 border-black pb-3'>
							Faol savollar ro'yxati
						</h3>
						{loading ? (
							<Loader2 className='w-8 h-8 animate-spin mx-auto mt-20 opacity-20' />
						) : questions.length === 0 ? (
							<p className='text-center py-20 text-[10px] uppercase font-black opacity-20 italic'>
								Savollar topilmadi. Jarayon boshlandi.
							</p>
						) : (
							questions.map((q, i) => (
								<div
									key={q.$id}
									className='bento-card p-4 bg-white group bento-card-hover cursor-default'
								>
									<div className='flex justify-between gap-4 mb-4'>
										<span className='text-[10px] font-black uppercase text-blue-600'>
											Savol #{i + 1}
										</span>
										<button
											onClick={() => handleDeleteQuestion(q.$id)}
											className='text-red-500 opacity-0 group-hover:opacity-100 transition-all hover:scale-110'
										>
											<Trash2 size={14} />
										</button>
									</div>
									<p className='text-sm font-black italic mb-4 line-clamp-2 leading-tight'>
										{q.text}
									</p>
									<div className='grid grid-cols-2 gap-2'>
										{JSON.parse(q.options as any).map(
											(opt: string, idx: number) => (
												<div
													key={idx}
													className={cn(
														'p-2 text-[8px] font-black uppercase border-2 rounded-lg truncate',
														idx === q.correctAnswer
															? 'bg-green-500 text-white border-black'
															: 'bg-white border-black opacity-30',
													)}
												>
													{opt || "Bo'sh parametr"}
												</div>
											),
										)}
									</div>
								</div>
							))
						)}
					</div>

					{/* Form Section */}
					<div className='lg:col-span-8 p-10 overflow-y-auto bg-white'>
						<h3 className='text-[10px] font-black uppercase text-gray-400 border-b-2 border-black pb-3 mb-10'>
							Yangi savol qo'shish
						</h3>
						<form onSubmit={handleAdd} className='space-y-8 max-w-2xl mx-auto'>
							<div className='space-y-2'>
								<label className='text-[10px] font-black uppercase text-gray-400 px-1'>
									Savol matni
								</label>
								<textarea
									required
									className='w-full p-5 border-2 border-black rounded-xl font-bold bg-gray-50 focus:bg-blue-50/30 transition-all focus:outline-none resize-none'
									rows={3}
									placeholder='Savol matnini kiriting...'
									value={newQ.text}
									onChange={e => setNewQ({ ...newQ, text: e.target.value })}
								/>
							</div>
							<div className='space-y-2'>
								<label className='text-[10px] font-black uppercase text-gray-400 px-1'>
									Rasm URL (ixtiyoriy)
								</label>
								<div className='relative'>
									<ImageIcon className='absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-30' />
									<input
										className='w-full pl-12 pr-5 py-4 border-2 border-black rounded-xl font-bold bg-gray-50 focus:bg-blue-50/30 transition-all focus:outline-none'
										placeholder='https://images.unsplash.com/...'
										value={newQ.imageUrl}
										onChange={e =>
											setNewQ({ ...newQ, imageUrl: e.target.value })
										}
									/>
								</div>
							</div>

							<div className='space-y-4'>
								<label className='text-[10px] font-black uppercase text-gray-400 px-1'>
									Variantlar va to'g'ri javob
								</label>
								<div className='grid md:grid-cols-2 gap-4'>
									{newQ.options.map((opt, idx) => (
										<div key={idx} className='flex gap-4 items-center'>
											<button
												type='button'
												onClick={() => setNewQ({ ...newQ, correctAnswer: idx })}
												className={cn(
													'w-12 h-12 border-2 rounded-xl flex items-center justify-center transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none',
													newQ.correctAnswer === idx
														? 'bg-green-500 border-black text-white'
														: 'bg-white border-black',
												)}
											>
												{newQ.correctAnswer === idx ? (
													<CheckCircle2 size={24} />
												) : (
													<span className='font-black text-lg'>
														{String.fromCharCode(65 + idx)}
													</span>
												)}
											</button>
											<input
												required
												placeholder={`Variant ${String.fromCharCode(65 + idx)}...`}
												className='flex-1 px-4 py-3 border-2 border-black rounded-xl font-bold text-sm bg-white focus:bg-blue-50/30 transition-all focus:outline-none'
												value={opt}
												onChange={e => {
													const next = [...newQ.options]
													next[idx] = e.target.value
													setNewQ({ ...newQ, options: next })
												}}
											/>
										</div>
									))}
								</div>
							</div>

							<button
								type='submit'
								disabled={loading}
								className='w-full h-16 bento-button bg-black text-white flex items-center justify-center gap-3 text-sm mt-8'
							>
								{loading ? (
									<Loader2 className='w-6 h-6 animate-spin' />
								) : (
									<>
										<Plus className='w-5 h-5' />
										Savolni saqlash
									</>
								)}
							</button>
						</form>
					</div>
				</div>
			</div>
		</div>
	)
}
