import { ID, Query, Permission, Role } from 'appwrite'
import { account, databases, APPWRITE_CONFIG } from '../lib/appwrite'
import {
	Quiz,
	Question,
	QuizResult,
	UserProfile,
	QuizInput,
	QuestionInput,
	QuizResultInput,
	UserProfileInput,
} from '../types'

const { databaseId, collections } = APPWRITE_CONFIG

export const appwriteService = {
	// Auth & Profile
	async register(data: Omit<UserProfileInput, 'role'> & { password: string }) {
		try {
			await account.deleteSession('current')
		} catch (_) {}
		const userId = ID.unique()
		await account.create(
			userId,
			`${data.phone}@valiteach.uz`,
			data.password,
			`${data.name} ${data.surname}`,
		)
		await account.createEmailPasswordSession(
			`${data.phone}@valiteach.uz`,
			data.password,
		)

		// Create profile document
		return await databases.createDocument(
			databaseId!,
			collections.users!,
			userId,
			{
				name: data.name,
				surname: data.surname,
				phone: data.phone,
				branch: data.branch,
				ageCategory: data.ageCategory,
				role: 'student',
			},
		)
	},

	async login(phone: string, pword: string) {
		try {
			await account.deleteSession('current')
		} catch (_) {}
		return await account.createEmailPasswordSession(
			`${phone}@valiteach.uz`,
			pword,
		)
	},

	async logout() {
		return await account.deleteSession('current')
	},

	async getCurrentUser() {
		try {
			const user = await account.get()
			const profile = await databases.getDocument<UserProfile>(
				databaseId!,
				collections.users!,
				user.$id,
			)
			return profile
		} catch {
			return null
		}
	},

	// Quizzes
	async getQuizzes(audience?: string) {
		const queries = [Query.orderDesc('$createdAt')]
		if (audience) queries.push(Query.equal('audience', audience))

		const res = await databases.listDocuments<Quiz>(
			databaseId!,
			collections.quizzes!,
			queries,
		)
		return res.documents
	},

	async hasUserCompletedQuiz(userId: string, quizId: string) {
		const res = await databases.listDocuments(
			databaseId!,
			collections.results!,
			[
				Query.equal('userId', userId),
				Query.equal('quizId', quizId),
				Query.limit(1),
			],
		)
		return res.total > 0
	},

	async createQuiz(data: QuizInput) {
		return await databases.createDocument(
			databaseId!,
			collections.quizzes!,
			ID.unique(),
			data,
		)
	},

	async updateQuiz(quizId: string, data: Partial<QuizInput>) {
		return await databases.updateDocument(
			databaseId!,
			collections.quizzes!,
			quizId,
			data,
		)
	},

	async deleteQuiz(quizId: string) {
		return await databases.deleteDocument(
			databaseId!,
			collections.quizzes!,
			quizId,
		)
	},
	async deleteQuestion(questionId: string) {
		return await databases.deleteDocument(
			databaseId!,
			collections.questions!,
			questionId,
		)
	},

	// Questions
	async getQuestions(quizId: string) {
		const res = await databases.listDocuments<Question>(
			databaseId!,
			collections.questions!,
			[Query.equal('quizId', quizId)],
		)
		return res.documents
	},

	async createQuestion(data: QuestionInput) {
		return await databases.createDocument(
			databaseId!,
			collections.questions!,
			ID.unique(),
			data,
		)
	},

	// Results
	async saveResult(data: QuizResultInput) {
		return await databases.createDocument(
			databaseId!,
			collections.results!,
			ID.unique(),
			data,
		)
	},

	async getResults(userId?: string) {
		const queries = [Query.orderDesc('$createdAt')]
		if (userId) queries.push(Query.equal('userId', userId))

		const res = await databases.listDocuments<QuizResult>(
			databaseId!,
			collections.results!,
			queries,
		)
		return res.documents
	},
	async deleteQuestion(questionId: string) {
		return await databases.deleteDocument(
			databaseId!,
			collections.questions!,
			questionId,
		)
	},

	// Real-time subscription helper
	subscribeToResults(callback: (payload: any) => void) {
		return account.client.subscribe(
			`databases.${databaseId}.collections.${collections.results}.documents`,
			callback,
		)
	},
}
