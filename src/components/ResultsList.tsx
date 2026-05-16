import { useState, useEffect } from 'react'
import { appwriteService } from '../services/appwriteService'
import { QuizResult } from '../types'
import { useAuth } from '../hooks/useAuth'
import { motion } from 'motion/react'
import {
	Trophy,
	CheckCircle,
	XCircle,
	ChevronDown,
	TrendingUp,
	Loader2,
	Trash2,
} from 'lucide-react'
import { cn } from '../lib/utils'
import { databases, APPWRITE_CONFIG } from '../lib/appwrite'

export function ResultsList() {
	const { user } = useAuth()
	const [results, setResults] = useState<QuizResult[]>([])
	const [loading, setLoading] = useState(true)
	const [expanded, setExpanded] = useState<string | null>(null)

	useEffect(() => {
		async function fetch() {
			try {
				const data = await appwriteService.getResults(
					user?.role === 'admin' ? undefined : user?.$id,
				)
				setResults(data)
			} catch (err) {
				console.error(err)
			} finally {
				setLoading(false)
			}
		}
		fetch()

		if (user?.role === 'admin') {
			const unsubscribe = appwriteService.subscribeToResults(res => {
				if (
					res.events.includes('databases.*.collections.*.documents.*.create')
				) {
					setResults(prev => [res.payload as QuizResult, ...prev])
				}
			})
			return () => unsubscribe()
		}
	}, [user])

	const deleteResult = async (id: string) => {
		if (!confirm('Ushbu natijani o\'chirmoqchimisiz?')) return;
		try {
			await databases.deleteDocument(
				APPWRITE_CONFIG.databaseId!,
				APPWRITE_CONFIG.collections.results!,
				id
			);
			setResults(prev => prev.filter(r => r.$id !== id));
		} catch (err) {
			console.error('Error deleting result:', err);
		}
	};

	if (loading)
		return (
			<div className='p-20 text-center'>
				<Loader2 className='w-8 h-8 animate-spin mx-auto opacity-20' />
			</div>
		)

	const parseAnswers = (ans: string | any[]): any[] => {
		try {
			return typeof ans === 'string' ? JSON.parse(ans) : ans
		} catch {
			return []
		}
	}

	const totalPoints = results.reduce((acc, r) => acc + r.score, 0)
	const totalQuestions = results.reduce((acc, r) => acc + r.totalQuestions, 0)
	const avgAccuracy =
		totalQuestions > 0 ? Math.round((totalPoints / totalQuestions) * 100) : 0

	return (
		<div className='p-8 space-y-10 mt-10'>
			<div className='flex flex-col md:flex-row md:items-end justify-between gap-6'>
				<div>
					<h2 className='text-xs font-black uppercase tracking-[0.3em] text-gray-400 mb-2'>
						Samaradorlik ko'rsatkichlari{' '}
						{user?.role === 'admin' ? "[Tizim bo'ylab]" : `[${user?.surname}]`}
					</h2>
					<h1 className='text-5xl font-black italic tracking-tighter uppercase'>
						Natijalar <span className='text-blue-600'>Tarixi</span>
					</h1>
				</div>

				<div className='flex gap-4'>
					<div className='bg-black text-white px-6 py-4 bento-card border-none shadow-[4px_4px_0px_0px_rgba(37,99,235,0.4)]'>
						<div className='text-[9px] font-black uppercase opacity-60 mb-1'>
							O'rtacha aniqlik
						</div>
						<div className='text-3xl font-black italic'>{avgAccuracy}%</div>
					</div>
					<div className='bg-white px-6 py-4 bento-card'>
						<div className='text-[9px] font-black uppercase text-gray-400 mb-1'>
							Jami yakunlangan
						</div>
						<div className='text-3xl font-black italic'>{results.length}</div>
					</div>
				</div>
			</div>

			<div className='grid gap-6'>
				{results.length === 0 ? (
					<div className='py-24 text-center bento-card border-dashed'>
						<TrendingUp size={48} className='mx-auto opacity-10 mb-4' />
						<p className='text-xs font-black uppercase opacity-30 tracking-widest'>
							Hozircha natijalar topilmadi
						</p>
					</div>
				) : (
					results.map(res => (
						<div key={res.$id} className='bento-card overflow-hidden'>
							<div
								className='p-6 flex flex-wrap items-center justify-between gap-4 cursor-pointer hover:bg-gray-50/50 transition-colors'
								onClick={() =>
									setExpanded(expanded === res.$id ? null : res.$id)
								}
							>
								<div className='flex items-center gap-6'>
									<div
										className={cn(
											'w-16 h-16 border-2 border-black rounded-2xl flex flex-col items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]',
											res.score / res.totalQuestions >= 0.8
												? 'bg-green-500 text-white'
												: res.score / res.totalQuestions >= 0.5
												? 'bg-orange-400 text-black'
												: 'bg-red-500 text-white',
										)}
									>
										<span className='text-lg font-black leading-none'>
											{res.score}
										</span>
										<span className='text-[8px] font-black uppercase opacity-60'>
											ball
										</span>
									</div>

									<div>
										{user?.role === 'admin' && (
											<div className='text-[9px] font-black uppercase text-blue-600 mb-1'>
												FOYDALANUVCHI: {res.userName}
											</div>
										)}
										<h3 className='text-2xl font-black italic tracking-tight uppercase group-hover:text-blue-600 transition-colors'>
											{res.quizTitle}
										</h3>
									</div>
								</div>

								<div className='flex flex-wrap items-center gap-4'>
									<div className='flex flex-col items-end'>
										<span className='text-[8px] font-black uppercase text-gray-400'>
											Sana
										</span>
										<span className='text-xs font-bold italic'>
											{new Date(res.$createdAt).toLocaleDateString()} ·{' '}
											{new Date(res.$createdAt).toLocaleTimeString([], {
												hour: '2-digit',
												minute: '2-digit',
											})}
										</span>
									</div>

									{user?.role === 'admin' && (
										<button
											onClick={e => {
												e.stopPropagation();
												deleteResult(res.$id);
											}}
											className='p-2 border-2 border-red-200 text-red-400 rounded-md hover:bg-red-50 hover:border-red-400 hover:text-red-600 transition-all'
											title="O'chirish"
										>
											<Trash2 className='w-4 h-4' />
										</button>
									)}

									<ChevronDown
										className={cn(
											'w-5 h-5 transition-all',
											expanded === res.$id && 'rotate-180',
										)}
									/>
								</div>
							</div>

							<motion.div
								initial={false}
								animate={{ height: expanded === res.$id ? 'auto' : 0 }}
								className='overflow-hidden bg-gray-50/50'
							>
								<div className='p-8 border-t-2 border-dashed border-gray-200'>
									<div className='grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-10 gap-3'>
										{parseAnswers(res.answers).map((ans: any, i: number) => (
											<div
												key={i}
												className={cn(
													'aspect-square flex flex-col items-center justify-center bento-card bg-white',
													ans.isCorrect
														? 'bg-green-50 border-green-500/30'
														: 'bg-red-50 border-red-500/30 opacity-50',
												)}
											>
												<span className='text-[8px] font-black opacity-30 italic mb-1 uppercase'>
													Savol {i + 1}
												</span>
												{ans.isCorrect ? (
													<CheckCircle className='w-5 h-5 text-green-500' />
												) : (
													<XCircle className='w-5 h-5 text-red-500' />
												)}
											</div>
										))}
									</div>
								</div>
							</motion.div>
						</div>
					))
				)}
			</div>
		</div>
	)
}
