import { useState, useEffect } from 'react'
import { appwriteService } from '../services/appwriteService'
import { Quiz } from '../types'
import { motion } from 'motion/react'
import {
	Search,
	Filter,
	BookOpen,
	Clock,
	ChevronRight,
	Loader2,
	Play,
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

export function QuizzesList({
	onSelectQuiz,
}: {
	onSelectQuiz: (id: string) => void
}) {
	const [quizzes, setQuizzes] = useState<Quiz[]>([])
	const [loading, setLoading] = useState(true)
	const [search, setSearch] = useState('')
	const [category, setCategory] = useState('all')
	const { user } = useAuth()
	const [completedQuizIds, setCompletedQuizIds] = useState<string[]>([])
	useEffect(() => {
		async function fetch() {
			try {
				const audience = user?.ageCategory === 'junior' ? 'kichik' : 'katta'
				const data = await appwriteService.getQuizzes(audience)
				setQuizzes(data)

				if (user) {
					const completed = await Promise.all(
						data.map(q =>
							appwriteService.hasUserCompletedQuiz(user.$id, q.$id),
						),
					)
					setCompletedQuizIds(
						data.filter((_, i) => completed[i]).map(q => q.$id),
					)
				}
			} catch (err) {
				console.error(err)
			} finally {
				setLoading(false)
			}
		}
		fetch()
	}, [user])

	const filtered = quizzes.filter(q => {
		const matchesSearch =
			q.title.toLowerCase().includes(search.toLowerCase()) ||
			q.subject.toLowerCase().includes(search.toLowerCase())
		const matchesCategory = category === 'all' || q.category === category
		return matchesSearch && matchesCategory
	})

	const categories = ['all', ...new Set(quizzes.map(q => q.category))]

	if (loading)
		return (
			<div className='h-64 flex items-center justify-center'>
				<Loader2 className='w-8 h-8 animate-spin' />
			</div>
		)

	return (
		<div className='p-8 space-y-10 mt-10'>
			{/* Header & Filter */}
			<div className='flex flex-col md:flex-row md:items-end justify-between gap-6'>
				<div>
					<h2 className='text-xs font-black uppercase tracking-[0.3em] text-gray-400 mb-2'>
						Resource Library
					</h2>
					<h1 className='text-5xl font-black italic tracking-tighter uppercase'>
						Available <span className='text-blue-600'>Tests</span>
					</h1>
				</div>

				<div className='flex flex-wrap gap-4 items-center'>
					<div className='relative min-w-[320px]'>
						<Search className='absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30' />
						<input
							type='text'
							placeholder='Query by title or subject...'
							className='w-full pl-12 pr-4 py-3 bg-white border-2 border-black rounded-xl font-bold text-xs uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:translate-x-[-1px] focus:translate-y-[-1px] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all'
							value={search}
							onChange={e => setSearch(e.target.value)}
						/>
					</div>
					<div className='flex items-center bg-white border-2 border-black rounded-xl overflow-hidden shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'>
						<span className='px-4 border-r-2 border-black bg-gray-50 h-10 flex items-center'>
							<Filter className='w-3 h-3' />
						</span>
						<select
							className='px-4 h-10 bg-white font-black text-[10px] uppercase tracking-widest focus:outline-none cursor-pointer'
							value={category}
							onChange={e => setCategory(e.target.value)}
						>
							{categories.map(c => (
								<option key={c} value={c}>
									{c}
								</option>
							))}
						</select>
					</div>
				</div>
			</div>

			{/* Grid */}
			{filtered.length === 0 ? (
				<div className='py-24 text-center bento-card border-dashed'>
					<p className='text-xs font-black uppercase opacity-30 tracking-widest'>
						Sizning qidiruvingizga mos resurslar topilmadi
					</p>
				</div>
			) : (
				<div className='grid sm:grid-cols-2 lg:grid-cols-3 gap-8'>
					{filtered.map((quiz, idx) => (
						<motion.div
							layout
							key={quiz.$id}
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: idx * 0.05 }}
							className={`group bento-card overflow-hidden flex flex-col ${completedQuizIds.includes(quiz.$id) ? 'opacity-60 cursor-not-allowed' : 'bento-card-hover cursor-pointer'}`}
							onClick={() =>
								!completedQuizIds.includes(quiz.$id) && onSelectQuiz(quiz.$id)
							}
						>
							<div className='aspect-[16/10] bg-gray-50 overflow-hidden border-b-2 border-black relative'>
								{quiz.imageUrl ? (
									<img
										src={quiz.imageUrl}
										alt=''
										className='w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700'
									/>
								) : (
									<div className='w-full h-full flex items-center justify-center opacity-10'>
										<BookOpen size={64} />
									</div>
								)}
								<div className='absolute top-4 left-4 bg-black text-white px-3 py-1 rounded-md font-black text-[10px] uppercase tracking-widest shadow-[2px_2px_0px_0px_rgba(255,255,255,0.2)]'>
									{quiz.category}
								</div>
							</div>

							<div className='p-6 flex-1 flex flex-col'>
								<div className='text-[10px] font-black uppercase tracking-widest text-[#f97316] mb-2 flex items-center gap-1'>
									<span className='w-1.5 h-1.5 rounded-full bg-[#f97316]'></span>
									{quiz.subject}
								</div>
								<h3 className='text-2xl font-black italic tracking-tight mb-4 line-clamp-1 group-hover:text-blue-600 transition-colors'>
									{quiz.title}
								</h3>
								<p className='text-xs leading-relaxed text-gray-500 mb-8 line-clamp-2 font-medium'>
									{quiz.description}
								</p>

								<div className='mt-auto pt-5 border-t-2 border-dashed border-gray-100 flex items-center justify-between'>
									<div className='flex items-center gap-2 text-[10px] font-black uppercase text-gray-400'>
										<Clock className='w-3 h-3' />
										{new Date(quiz.$createdAt).toLocaleDateString()}
									</div>
									{completedQuizIds.includes(quiz.$id) ? (
										<span className='text-[10px] font-black uppercase text-green-600 bg-green-50 px-2 py-1 rounded border-2 border-green-200'>
											✓ Yakunlangan
										</span>
									) : (
										<div className='group-hover:translate-x-1 transition-transform'>
											<Play className='w-5 h-5 text-black fill-current' />
										</div>
									)}
								</div>
							</div>
						</motion.div>
					))}
				</div>
			)}
		</div>
	)
}
