import { useState, useCallback, useEffect, Fragment } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Listbox, Transition } from "@headlessui/react"
import confetti from "canvas-confetti"
import {
	Clock,
	ChevronLeft,
	ChevronRight,
	LayoutDashboard,
	BarChart3,
	Settings,
	Menu,
	X,
	Check,
	ChevronDown,
	AlertTriangle,
	Sparkles,
	FileCheck,
	FileClock,
	FileEdit,
	Loader2,
	Search,
	User as UserIcon,
	Sun,
	Moon,
} from "lucide-react"
import "./App.css"
import { usePowerContext } from "./PowerProvider"
import { useTheme } from "./ThemeProvider"

// Dataverse Services and Models
import {
	Cha_projectsService,
	Cha_timesheetsService,
	Cha_timesheetentriesService,
	Cha_timesheetsModel,
	Office365UsersService,
	Office365UsersModel,
} from "./generated"

// User type for the selector
interface SelectedUser {
	id: string
	displayName: string
	userPrincipalName: string
	mail?: string
}

// Types
interface DayEntry {
	id: string
	day: string
	date: Date
	project: string
	projectId: string | null
	hours: number
	notes: string
	timesheetEntryId: string | null
}

interface WeekData {
	startDate: Date
	endDate: Date
	entries: DayEntry[]
	status: "draft" | "submitted" | "approved"
	timesheetId: string | null
}

interface Project {
	id: string
	name: string
}

const getMonday = (d: Date): Date => {
	const date = new Date(d)
	const day = date.getDay()
	const diff = date.getDate() - day + (day === 0 ? -6 : 1)
	date.setDate(diff)
	date.setHours(0, 0, 0, 0)
	return date
}

const formatDate = (date: Date): string => {
	return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

const formatDateRange = (start: Date, end: Date): string => {
	return `${formatDate(start)} - ${formatDate(end)}, ${start.getFullYear()}`
}

// Helper to generate empty week data
const generateEmptyWeekData = (startDate: Date): WeekData => {
	const entries: DayEntry[] = []
	const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]

	for (let i = 0; i < 5; i++) {
		const date = new Date(startDate)
		date.setDate(startDate.getDate() + i)
		entries.push({
			id: `day-${i}`,
			day: days[i],
			date,
			project: "",
			projectId: null,
			hours: 0,
			notes: "",
			timesheetEntryId: null,
		})
	}

	const endDate = new Date(startDate)
	endDate.setDate(startDate.getDate() + 4)

	return {
		startDate,
		endDate,
		entries,
		status: "draft",
		timesheetId: null,
	}
}

// Toast Component
const Toast = ({
	message,
	show,
	onClose,
}: {
	message: string
	show: boolean
	onClose: () => void
}) => {
	useEffect(() => {
		if (show) {
			const timer = setTimeout(onClose, 3000)
			return () => clearTimeout(timer)
		}
	}, [show, onClose])

	return (
		<AnimatePresence>
			{show && (
				<motion.div
					initial={{ opacity: 0, y: 50, scale: 0.9 }}
					animate={{ opacity: 1, y: 0, scale: 1 }}
					exit={{ opacity: 0, y: 50, scale: 0.9 }}
					className="fixed bottom-6 right-6 z-50"
				>
					<div className="flex items-center gap-3 px-6 py-4 bg-linear-to-r from-emerald-500 to-teal-500 rounded-2xl shadow-2xl shadow-emerald-500/30">
						<div className="p-1.5 bg-white/20 rounded-full">
							<Check className="w-5 h-5 text-white" />
						</div>
						<span className="text-white font-semibold">
							{message}
						</span>
						<Sparkles className="w-5 h-5 text-white/80" />
					</div>
				</motion.div>
			)}
		</AnimatePresence>
	)
}

// Theme Toggle Component
const ThemeToggle = () => {
	const { theme, toggleTheme } = useTheme()

	return (
		<motion.button
			onClick={toggleTheme}
			whileHover={{ x: 4 }}
			whileTap={{ scale: 0.98 }}
			className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-white/60 dark:hover:text-white dark:hover:bg-white/5 transition-all duration-200"
			aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
		>
			<AnimatePresence mode="wait">
				{theme === "dark" ? (
					<motion.div
						key="moon"
						initial={{ rotate: -90, opacity: 0 }}
						animate={{ rotate: 0, opacity: 1 }}
						exit={{ rotate: 90, opacity: 0 }}
						transition={{ duration: 0.2 }}
					>
						<Moon className="w-5 h-5" />
					</motion.div>
				) : (
					<motion.div
						key="sun"
						initial={{ rotate: 90, opacity: 0 }}
						animate={{ rotate: 0, opacity: 1 }}
						exit={{ rotate: -90, opacity: 0 }}
						transition={{ duration: 0.2 }}
					>
						<Sun className="w-5 h-5" />
					</motion.div>
				)}
			</AnimatePresence>
			<span className="font-medium">
				{theme === "dark" ? "Dark Mode" : "Light Mode"}
			</span>
		</motion.button>
	)
}

// User Selector Component - Searchable combobox for Office365 users
const UserSelector = ({
	value,
	onChange,
	disabled,
}: {
	value: SelectedUser | null
	onChange: (user: SelectedUser | null) => void
	disabled?: boolean
}) => {
	const [searchTerm, setSearchTerm] = useState("")
	const [users, setUsers] = useState<SelectedUser[]>([])
	const [isLoading, setIsLoading] = useState(false)
	const [isOpen, setIsOpen] = useState(false)

	// Debounced search function
	useEffect(() => {
		const searchUsers = async () => {
			if (!isOpen) return

			setIsLoading(true)
			try {
				const result = await Office365UsersService.SearchUserV2(
					searchTerm || undefined,
					25, // Display up to 25 users
					false, // isSearchTermRequired - false so we get users even without search term
				)
				if (result.data?.value) {
					setUsers(
						result.data.value.map(
							(u: Office365UsersModel.User) => ({
								id: u.Id,
								displayName: u.DisplayName || "",
								userPrincipalName: u.UserPrincipalName || "",
								mail: u.Mail,
							}),
						),
					)
				}
			} catch (error) {
				console.error("Failed to search users:", error)
				setUsers([])
			} finally {
				setIsLoading(false)
			}
		}

		const debounceTimer = setTimeout(searchUsers, 300)
		return () => clearTimeout(debounceTimer)
	}, [searchTerm, isOpen])

	const handleSelect = (user: SelectedUser) => {
		onChange(user)
		setIsOpen(false)
		setSearchTerm("")
	}

	return (
		<div className="relative">
			<button
				type="button"
				onClick={() => !disabled && setIsOpen(!isOpen)}
				disabled={disabled}
				className="relative w-full cursor-pointer rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 py-2.5 pl-4 pr-10 text-left text-slate-700 dark:text-white/90 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all duration-200 hover:bg-slate-100 dark:hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
			>
				<span className="flex items-center gap-2">
					<UserIcon className="w-4 h-4 text-slate-400 dark:text-white/50" />
					<span className="block truncate">
						{value?.displayName || "Select user..."}
					</span>
				</span>
				<span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
					<ChevronDown
						className={`h-4 w-4 text-slate-400 dark:text-white/50 transition-transform ${isOpen ? "rotate-180" : ""}`}
					/>
				</span>
			</button>

			<AnimatePresence>
				{isOpen && (
					<motion.div
						initial={{ opacity: 0, y: -10 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -10 }}
						className="absolute z-20 mt-2 w-full rounded-xl bg-white dark:bg-slate-800/95 backdrop-blur-xl border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden"
					>
						{/* Search Input */}
						<div className="p-2 border-b border-slate-200 dark:border-white/10">
							<div className="relative">
								<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-white/40" />
								<input
									type="text"
									value={searchTerm}
									onChange={(e) =>
										setSearchTerm(e.target.value)
									}
									placeholder="Search users..."
									className="w-full rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 py-2 pl-9 pr-4 text-slate-900 dark:text-white text-sm placeholder:text-slate-400 dark:placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
									autoFocus
								/>
							</div>
						</div>

						{/* User List */}
						<div className="max-h-60 overflow-auto py-2">
							{isLoading ? (
								<div className="flex items-center justify-center py-4">
									<Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
								</div>
							) : users.length === 0 ? (
								<div className="px-4 py-3 text-sm text-slate-400 dark:text-white/50 text-center">
									No users found
								</div>
							) : (
								users.map((user) => (
									<button
										key={user.id}
										type="button"
										onClick={() => handleSelect(user)}
										className={`w-full relative cursor-pointer select-none py-2.5 pl-10 pr-4 text-left text-sm transition-colors hover:bg-indigo-500/20 ${
											value?.id === user.id
												? "text-slate-900 dark:text-white bg-indigo-500/10"
												: "text-slate-600 dark:text-white/70"
										}`}
									>
										<div className="flex flex-col">
											<span
												className={`block truncate ${value?.id === user.id ? "font-semibold" : ""}`}
											>
												{user.displayName}
											</span>
											<span className="block truncate text-xs text-slate-400 dark:text-white/40">
												{user.userPrincipalName}
											</span>
										</div>
										{value?.id === user.id && (
											<span className="absolute inset-y-0 left-0 flex items-center pl-3 text-indigo-400">
												<Check className="h-4 w-4" />
											</span>
										)}
									</button>
								))
							)}
						</div>
					</motion.div>
				)}
			</AnimatePresence>

			{/* Click outside to close */}
			{isOpen && (
				<div
					className="fixed inset-0 z-10"
					onClick={() => setIsOpen(false)}
				/>
			)}
		</div>
	)
}

// Project Selector Component
const ProjectSelector = ({
	value,
	onChange,
	disabled,
	projects,
}: {
	value: string
	onChange: (value: string, projectId: string | null) => void
	disabled?: boolean
	projects: Project[]
}) => {
	const handleChange = (projectName: string) => {
		const project = projects.find((p) => p.name === projectName)
		onChange(projectName, project?.id || null)
	}

	return (
		<Listbox value={value} onChange={handleChange} disabled={disabled}>
			<div className="relative">
				<Listbox.Button className="relative w-full cursor-pointer rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 py-2.5 pl-4 pr-10 text-left text-slate-700 dark:text-white/90 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all duration-200 hover:bg-slate-100 dark:hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed">
					<span className="block truncate">
						{value || "Select project..."}
					</span>
					<span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
						<ChevronDown className="h-4 w-4 text-slate-400 dark:text-white/50" />
					</span>
				</Listbox.Button>
				<Transition
					as={Fragment}
					leave="transition ease-in duration-100"
					leaveFrom="opacity-100"
					leaveTo="opacity-0"
				>
					<Listbox.Options className="absolute z-20 mt-2 max-h-60 w-full overflow-auto rounded-xl bg-white dark:bg-slate-800/95 backdrop-blur-xl border border-slate-200 dark:border-white/10 py-2 shadow-2xl focus:outline-none">
						{projects.map((project) => (
							<Listbox.Option
								key={project.id}
								value={project.name}
								className={({ active }) =>
									`relative cursor-pointer select-none py-2.5 pl-10 pr-4 text-sm transition-colors ${
										active
											? "bg-indigo-500/20 text-slate-900 dark:text-white"
											: "text-slate-600 dark:text-white/70"
									}`
								}
							>
								{({ selected }) => (
									<>
										<span
											className={`block truncate ${
												selected
													? "font-semibold text-slate-900 dark:text-white"
													: ""
											}`}
										>
											{project.name}
										</span>
										{selected && (
											<span className="absolute inset-y-0 left-0 flex items-center pl-3 text-indigo-400">
												<Check className="h-4 w-4" />
											</span>
										)}
									</>
								)}
							</Listbox.Option>
						))}
					</Listbox.Options>
				</Transition>
			</div>
		</Listbox>
	)
}

// Day Card Component
const DayCard = ({
	entry,
	index,
	isToday,
	onUpdate,
	disabled,
	projects,
}: {
	entry: DayEntry
	index: number
	isToday: boolean
	onUpdate: (
		id: string,
		field: keyof DayEntry,
		value: string | number,
		projectId?: string | null,
	) => void
	disabled: boolean
	projects: Project[]
}) => {
	return (
		<motion.div
			initial={{ opacity: 0, y: 30 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: index * 0.08, duration: 0.4, ease: "easeOut" }}
			whileHover={{ scale: disabled ? 1 : 1.02, y: disabled ? 0 : -4 }}
			className={`group relative overflow-hidden rounded-2xl backdrop-blur-xl border transition-all duration-300 ${
				isToday
					? "bg-linear-to-br from-indigo-500/20 to-purple-500/20 border-indigo-400/30 shadow-xl shadow-indigo-500/10"
					: "bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 hover:shadow-xl hover:shadow-indigo-500/5"
			}`}
		>
			{/* Glow effect on hover */}
			<div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
				<div className="absolute inset-0 bg-linear-to-br from-indigo-500/5 to-purple-500/5" />
			</div>

			{/* Today indicator */}
			{isToday && (
				<div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-indigo-500 to-purple-500" />
			)}

			<div className="relative p-5">
				{/* Header */}
				<div className="flex items-center justify-between mb-4">
					<div>
						<h3
							className={`font-bold text-lg ${
								isToday
									? "text-slate-900 dark:text-white"
									: "text-slate-800 dark:text-white/90"
							}`}
						>
							{entry.day}
						</h3>
						<p className="text-sm text-slate-400 dark:text-white/50">
							{formatDate(entry.date)}
						</p>
					</div>
					{isToday && (
						<span className="px-3 py-1 text-xs font-semibold bg-linear-to-r from-indigo-500 to-purple-500 rounded-full text-white">
							Today
						</span>
					)}
				</div>

				{/* Project Selector */}
				<div className="mb-4">
					<label className="block text-xs font-medium text-slate-400 dark:text-white/50 mb-1.5">
						Project
					</label>
					<ProjectSelector
						value={entry.project}
						onChange={(value, projectId) =>
							onUpdate(entry.id, "project", value, projectId)
						}
						disabled={disabled}
						projects={projects}
					/>
				</div>

				{/* Hours Input */}
				<div className="mb-4">
					<label className="block text-xs font-medium text-slate-400 dark:text-white/50 mb-1.5">
						Hours
					</label>
					<div className="relative">
						<input
							type="number"
							step="0.5"
							min="0"
							max="24"
							value={entry.hours || ""}
							onChange={(e) =>
								onUpdate(
									entry.id,
									"hours",
									parseFloat(e.target.value) || 0,
								)
							}
							disabled={disabled}
							className="w-full rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 py-2.5 px-4 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all duration-200 hover:bg-slate-100 dark:hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
						/>
						<Clock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 dark:text-white/30" />
					</div>
				</div>

				{/* Notes */}
				<div className="mb-4">
					<label className="block text-xs font-medium text-slate-400 dark:text-white/50 mb-1.5">
						Notes
					</label>
					<textarea
						value={entry.notes}
						onChange={(e) =>
							onUpdate(entry.id, "notes", e.target.value)
						}
						disabled={disabled}
						rows={2}
						placeholder="What did you work on?"
						className="w-full rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 py-2.5 px-4 text-slate-900 dark:text-white text-sm placeholder:text-slate-300 dark:placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all duration-200 hover:bg-slate-100 dark:hover:bg-white/10 resize-none disabled:opacity-50 disabled:cursor-not-allowed"
					/>
				</div>

				{/* Daily Total */}
				<div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-white/10">
					<span className="text-sm text-slate-400 dark:text-white/50">
						Daily Total
					</span>
					<span
						className={`text-lg font-bold ${
							entry.hours > 0
								? "text-slate-900 dark:text-white"
								: "text-slate-300 dark:text-white/30"
						}`}
					>
						{entry.hours}h
					</span>
				</div>
			</div>
		</motion.div>
	)
}

// Main App Component
function App() {
	const { user } = usePowerContext()
	const [sidebarOpen, setSidebarOpen] = useState(false)
	const [currentWeek, setCurrentWeek] = useState<Date>(getMonday(new Date()))
	const [weekData, setWeekData] = useState<WeekData>(
		generateEmptyWeekData(getMonday(new Date())),
	)
	const [showToast, setShowToast] = useState(false)
	const [projects, setProjects] = useState<Project[]>([])
	const [loading, setLoading] = useState(true)
	const [timesheets, setTimesheets] = useState<
		Cha_timesheetsModel.Cha_timesheets[]
	>([])
	const [selectedUser, setSelectedUser] = useState<SelectedUser | null>(null)

	// Load projects from Dataverse
	useEffect(() => {
		const loadProjects = async () => {
			try {
				const result = await Cha_projectsService.getAll()
				if (result.data) {
					setProjects(
						result.data.map((p) => ({
							id: p.cha_projectid,
							name: p.cha_name,
						})),
					)
				}
			} catch (error) {
				console.error("Failed to load projects:", error)
			}
		}
		loadProjects()
	}, [])

	// Load timesheets and entries from Dataverse
	useEffect(() => {
		const loadTimesheetData = async () => {
			setLoading(true)
			try {
				// Load projects first to use for mapping
				const projectsResult = await Cha_projectsService.getAll()
				const projectsData: Project[] =
					projectsResult.data?.map((p) => ({
						id: p.cha_projectid,
						name: p.cha_name,
					})) || []

				// Load all timesheets
				const timesheetsResult = await Cha_timesheetsService.getAll()
				if (timesheetsResult.data) {
					setTimesheets(timesheetsResult.data)
				}

				// Load all timesheet entries with project lookup data
				const entriesResult = await Cha_timesheetentriesService.getAll()

				// Find entries for the current week
				const weekStart = currentWeek
				const weekEnd = new Date(currentWeek)
				weekEnd.setDate(weekEnd.getDate() + 6)

				// Build entries for each day (weekdays only)
				const days = [
					"Monday",
					"Tuesday",
					"Wednesday",
					"Thursday",
					"Friday",
				]

				const entries: DayEntry[] = days.map((day, i) => {
					const date = new Date(currentWeek)
					date.setDate(currentWeek.getDate() + i)

					// Find matching entry from Dataverse
					const matchingEntry = entriesResult.data?.find((entry) => {
						if (!entry.cha_date) return false
						const entryDate = new Date(entry.cha_date)
						return (
							entryDate.getFullYear() === date.getFullYear() &&
							entryDate.getMonth() === date.getMonth() &&
							entryDate.getDate() === date.getDate()
						)
					})

					// Look up project name from loaded projects using the project ID
					const projectId = matchingEntry?._cha_project_value || null
					const matchedProject = projectId
						? projectsData.find((p) => p.id === projectId)
						: null

					return {
						id: `day-${i}`,
						day,
						date,
						project:
							matchedProject?.name ||
							matchingEntry?.cha_projectname ||
							"",
						projectId: projectId,
						hours: matchingEntry?.cha_hours
							? parseFloat(matchingEntry.cha_hours)
							: 0,
						notes: matchingEntry?.cha_notes || "",
						timesheetEntryId:
							matchingEntry?.cha_timesheetentryid || null,
					}
				})

				// Find matching timesheet for this week
				const matchingTimesheet = timesheetsResult.data?.find((ts) => {
					if (!ts.cha_startdate) return false
					const tsStart = new Date(ts.cha_startdate)
					return (
						tsStart.getFullYear() === weekStart.getFullYear() &&
						tsStart.getMonth() === weekStart.getMonth() &&
						tsStart.getDate() === weekStart.getDate()
					)
				})

				// Set the user for the timesheet - if timesheet has an owner, use that; otherwise use logged-in user
				if (
					matchingTimesheet?.owneridname &&
					matchingTimesheet?._owninguser_value
				) {
					// Timesheet has a user - use that as default
					setSelectedUser({
						id: matchingTimesheet._owninguser_value,
						displayName: matchingTimesheet.owneridname,
						userPrincipalName: "", // We don't have this from the timesheet data
					})
				} else if (user) {
					// No timesheet or no owner - use logged-in user
					setSelectedUser({
						id: user.objectId,
						displayName: user.fullName,
						userPrincipalName: user.userPrincipalName,
					})
				}

				setWeekData({
					startDate: weekStart,
					endDate: weekEnd,
					entries,
					status: "draft", // Could map from Dataverse status if available
					timesheetId: matchingTimesheet?.cha_timesheetid || null,
				})
			} catch (error) {
				console.error("Failed to load timesheet data:", error)
				// Fall back to empty week data
				setWeekData(generateEmptyWeekData(currentWeek))
				// Set logged-in user as default when no timesheet data
				if (user) {
					setSelectedUser({
						id: user.objectId,
						displayName: user.fullName,
						userPrincipalName: user.userPrincipalName,
					})
				}
			} finally {
				setLoading(false)
			}
		}
		loadTimesheetData()
	}, [currentWeek, user])

	const navigateWeek = useCallback((direction: "prev" | "next") => {
		setCurrentWeek((prev) => {
			const newDate = new Date(prev)
			newDate.setDate(prev.getDate() + (direction === "next" ? 7 : -7))
			return newDate
		})
	}, [])

	const updateEntry = (
		id: string,
		field: keyof DayEntry,
		value: string | number,
		projectId?: string | null,
	) => {
		setWeekData((prev) => ({
			...prev,
			entries: prev.entries.map((entry) =>
				entry.id === id
					? {
							...entry,
							[field]: value,
							...(field === "project" && projectId !== undefined
								? { projectId }
								: {}),
						}
					: entry,
			),
		}))
	}

	const totalHours = weekData.entries.reduce(
		(sum, entry) => sum + entry.hours,
		0,
	)
	const isOvertime = totalHours > 40
	const isSubmitted = weekData.status !== "draft"

	const projectBreakdown = weekData.entries.reduce(
		(acc, entry) => {
			if (entry.project && entry.hours > 0) {
				acc[entry.project] = (acc[entry.project] || 0) + entry.hours
			}
			return acc
		},
		{} as Record<string, number>,
	)

	const handleSubmit = async () => {
		try {
			let timesheetId = weekData.timesheetId
			console.log("=== Starting timesheet submission ===")
			console.log("Current timesheetId:", timesheetId)

			// Create or update the timesheet record first
			const timesheetData = {
				cha_startdate: weekData.startDate.toISOString(),
				cha_enddate: weekData.endDate.toISOString(),
				cha_totalhours: totalHours,
			}
			console.log("Timesheet data to save:", timesheetData)

			if (timesheetId) {
				// Update existing timesheet
				console.log("Updating existing timesheet:", timesheetId)
				const updateResult = await Cha_timesheetsService.update(
					timesheetId,
					timesheetData,
				)
				console.log("Timesheet update result:", updateResult)
			} else {
				// Create new timesheet
				console.log("Creating new timesheet...")
				const result = await Cha_timesheetsService.create(
					timesheetData as any,
				)
				console.log("Timesheet create result:", result)
				console.log(
					"Full result object:",
					JSON.stringify(result, null, 2),
				)
				timesheetId = result.data?.cha_timesheetid ?? null
				console.log("New timesheetId:", timesheetId)
			}

			// Create or update timesheet entries in Dataverse
			console.log("=== Processing entries ===")
			console.log("Entries to process:", weekData.entries)
			for (const entry of weekData.entries) {
				console.log(
					`Entry: ${entry.day}, hours: ${entry.hours}, projectId: ${entry.projectId}`,
				)
				if (entry.hours > 0 && entry.projectId) {
					const entryData = {
						cha_date: entry.date.toISOString(),
						cha_hours: entry.hours,
						cha_notes: entry.notes || undefined,
						"cha_Project@odata.bind": `/cha_projects(${entry.projectId})`,
						...(timesheetId && {
							"cha_Timesheet@odata.bind": `/cha_timesheets(${timesheetId})`,
						}),
					}
					console.log("Entry data to save:", entryData)

					if (entry.timesheetEntryId) {
						// Update existing entry
						console.log(
							"Updating existing entry:",
							entry.timesheetEntryId,
						)
						const updateResult =
							await Cha_timesheetentriesService.update(
								entry.timesheetEntryId,
								entryData,
							)
						console.log("Entry update result:", updateResult)
					} else {
						// Create new entry
						console.log("Creating new entry...")
						const createResult =
							await Cha_timesheetentriesService.create(
								entryData as any,
							)
						console.log("Entry create result:", createResult)
					}
				}
			}

			console.log("=== Submission complete ===")
			setWeekData((prev) => ({
				...prev,
				status: "submitted",
				timesheetId,
			}))
			confetti({
				particleCount: 100,
				spread: 70,
				origin: { y: 0.6 },
				colors: ["#6366f1", "#8b5cf6", "#a855f7", "#22d3ee", "#10b981"],
			})
			setShowToast(true)
		} catch (error) {
			console.error("Failed to submit timesheet:", error)
			console.error("Error details:", JSON.stringify(error, null, 2))
		}
	}

	const today = new Date()
	today.setHours(0, 0, 0, 0)

	const getStatusConfig = (status: WeekData["status"]) => {
		switch (status) {
			case "draft":
				return {
					icon: FileEdit,
					label: "Draft",
					color: "text-amber-400",
					bg: "bg-amber-400/10",
				}
			case "submitted":
				return {
					icon: FileClock,
					label: "Submitted",
					color: "text-blue-400",
					bg: "bg-blue-400/10",
				}
			case "approved":
				return {
					icon: FileCheck,
					label: "Approved",
					color: "text-emerald-400",
					bg: "bg-emerald-400/10",
				}
		}
	}

	const statusConfig = getStatusConfig(weekData.status)
	const StatusIcon = statusConfig.icon

	return (
		<div className="min-h-screen bg-linear-to-br from-slate-100 via-slate-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
			{/* Mobile Sidebar Overlay */}
			<AnimatePresence>
				{sidebarOpen && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						onClick={() => setSidebarOpen(false)}
						className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
					/>
				)}
			</AnimatePresence>

			{/* Sidebar */}
			<aside
				className={`fixed top-0 left-0 h-full w-64 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-r border-slate-200 dark:border-white/5 z-50 transform transition-transform duration-300 ease-out lg:translate-x-0 ${
					sidebarOpen ? "translate-x-0" : "-translate-x-full"
				}`}
			>
				<div className="flex flex-col h-full p-6">
					{/* Profile */}
					<div className="flex items-center gap-4 mb-8">
						<div className="w-12 h-12 rounded-xl bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-500/30">
							{user?.fullName
								?.split(" ")
								.map((n) => n[0])
								.join("")
								.toUpperCase()
								.slice(0, 2) || "??"}
						</div>
						<div>
							<h3 className="font-semibold text-slate-900 dark:text-white">
								{user?.fullName || "Loading..."}
							</h3>
							<p className="text-sm text-slate-500 dark:text-white/50">
								{user?.userPrincipalName || ""}
							</p>
						</div>
					</div>

					{/* Navigation */}
					<nav className="flex-1 space-y-2">
						{[
							{
								icon: LayoutDashboard,
								label: "Dashboard",
								active: true,
							},
							{
								icon: BarChart3,
								label: "Reports",
								active: false,
							},
							{
								icon: Settings,
								label: "Settings",
								active: false,
							},
						].map((item) => (
							<motion.button
								key={item.label}
								whileHover={{ x: 4 }}
								whileTap={{ scale: 0.98 }}
								className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
									item.active
										? "bg-linear-to-r from-indigo-500/20 to-purple-500/20 text-slate-900 dark:text-white border border-indigo-500/30"
										: "text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
								}`}
							>
								<item.icon className="w-5 h-5" />
								<span className="font-medium">
									{item.label}
								</span>
							</motion.button>
						))}
					</nav>

					{/* Theme Toggle */}
					<ThemeToggle />

					{/* Status Section */}
					<div className="pt-6 border-t border-slate-200 dark:border-white/10">
						<h4 className="text-xs font-semibold text-slate-400 dark:text-white/40 uppercase tracking-wider mb-3">
							Timesheet Status
						</h4>
						<div className="space-y-2">
							{[
								{
									status: "draft" as const,
									count: timesheets.length || 1,
								},
								{ status: "submitted" as const, count: 0 },
								{ status: "approved" as const, count: 0 },
							].map((item) => {
								const config = getStatusConfig(item.status)
								const Icon = config.icon
								return (
									<div
										key={item.status}
										className={`flex items-center justify-between px-3 py-2 rounded-lg ${config.bg}`}
									>
										<div className="flex items-center gap-2">
											<Icon
												className={`w-4 h-4 ${config.color}`}
											/>
											<span
												className={`text-sm font-medium ${config.color}`}
											>
												{config.label}
											</span>
										</div>
										<span
											className={`text-sm font-bold ${config.color}`}
										>
											{item.count}
										</span>
									</div>
								)
							})}
						</div>
					</div>
				</div>
			</aside>

			{/* Main Content */}
			<div className="lg:pl-64">
				{/* Header */}
				<header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/5">
					<div className="flex items-center justify-between px-4 lg:px-8 h-16">
						{/* Mobile menu button */}
						<button
							onClick={() => setSidebarOpen(!sidebarOpen)}
							className="lg:hidden p-2 rounded-xl text-slate-500 dark:text-white/70 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
						>
							{sidebarOpen ? (
								<X className="w-6 h-6" />
							) : (
								<Menu className="w-6 h-6" />
							)}
						</button>

						{/* Logo */}
						<div className="flex items-center gap-3">
							<div className="p-2 bg-linear-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-indigo-500/30">
								<Clock className="w-5 h-5 text-white" />
							</div>
							<h1 className="text-xl font-bold text-slate-900 dark:text-white hidden sm:block">
								Weekly Timesheet
							</h1>
						</div>

						{/* Week Picker */}
						<div className="flex items-center gap-2">
							<motion.button
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
								onClick={() => navigateWeek("prev")}
								className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-white/70 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 transition-all"
							>
								<ChevronLeft className="w-5 h-5" />
							</motion.button>
							<div className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 min-w-45 text-center">
								<span className="text-sm font-medium text-slate-900 dark:text-white">
									{formatDateRange(
										weekData.startDate,
										weekData.endDate,
									)}
								</span>
							</div>
							<motion.button
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
								onClick={() => navigateWeek("next")}
								className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-white/70 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 transition-all"
							>
								<ChevronRight className="w-5 h-5" />
							</motion.button>
						</div>

						{/* Total Hours Badge */}
						<motion.div
							initial={{ scale: 0.9 }}
							animate={{ scale: 1 }}
							className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${
								isOvertime
									? "bg-red-500/10 border-red-500/30"
									: "bg-linear-to-r from-indigo-500/10 to-purple-500/10 border-indigo-500/30"
							}`}
						>
							<Clock
								className={`w-4 h-4 ${
									isOvertime
										? "text-red-400"
										: "text-indigo-400"
								}`}
							/>
							<span
								className={`font-bold ${
									isOvertime
										? "text-red-400"
										: "text-slate-900 dark:text-white"
								}`}
							>
								{totalHours}/40h
							</span>
							{isOvertime && (
								<AlertTriangle className="w-4 h-4 text-red-400" />
							)}
						</motion.div>
					</div>
				</header>

				{/* Weekly Header Bar */}
				<div className="px-4 lg:px-8 py-4">
					<div className="bg-linear-to-r from-indigo-500/20 via-purple-500/20 to-indigo-500/20 rounded-2xl border border-slate-200 dark:border-white/10 p-4">
						<div className="grid grid-cols-5 gap-2">
							{weekData.entries.map((entry) => {
								const entryDate = new Date(entry.date)
								entryDate.setHours(0, 0, 0, 0)
								const isToday =
									entryDate.getTime() === today.getTime()
								return (
									<div
										key={entry.id}
										className={`text-center py-2 rounded-xl transition-all ${
											isToday
												? "bg-linear-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30"
												: "bg-slate-100 dark:bg-white/5"
										}`}
									>
										<p
											className={`text-xs font-medium ${
												isToday
													? "text-white"
													: "text-slate-400 dark:text-white/50"
											}`}
										>
											{entry.day.slice(0, 3)}
										</p>
										<p
											className={`text-lg font-bold ${
												isToday
													? "text-white"
													: "text-slate-700 dark:text-white/80"
											}`}
										>
											{entry.date.getDate()}
										</p>
									</div>
								)
							})}
						</div>
					</div>
				</div>

				{/* Status Badge and User Selector */}
				<div className="px-4 lg:px-8 mb-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
					<div
						className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl ${statusConfig.bg} border border-slate-200 dark:border-white/10`}
					>
						<StatusIcon
							className={`w-4 h-4 ${statusConfig.color}`}
						/>
						<span className={`font-medium ${statusConfig.color}`}>
							{statusConfig.label}
						</span>
					</div>

					{/* User Selector */}
					<div className="flex items-center gap-3">
						<label className="text-sm font-medium text-slate-500 dark:text-white/60">
							Timesheet for:
						</label>
						<div className="w-64">
							<UserSelector
								value={selectedUser}
								onChange={setSelectedUser}
								disabled={isSubmitted}
							/>
						</div>
					</div>
				</div>

				{/* Timesheet Grid */}
				<main className="px-4 lg:px-8 pb-8">
					{loading ? (
						<div className="flex items-center justify-center py-20">
							<div className="flex flex-col items-center gap-4">
								<Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
								<p className="text-slate-600 dark:text-white/70">
									Loading timesheet data...
								</p>
							</div>
						</div>
					) : (
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
							{weekData.entries.map((entry, index) => {
								const entryDate = new Date(entry.date)
								entryDate.setHours(0, 0, 0, 0)
								return (
									<DayCard
										key={entry.id}
										entry={entry}
										index={index}
										isToday={
											entryDate.getTime() ===
											today.getTime()
										}
										onUpdate={updateEntry}
										disabled={isSubmitted}
										projects={projects}
									/>
								)
							})}
						</div>
					)}
				</main>

				{/* Footer Summary */}
				<footer className="sticky bottom-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200 dark:border-white/10">
					<div className="px-4 lg:px-8 py-4">
						<div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
							{/* Project Breakdown */}
							<div className="flex flex-wrap gap-3">
								{Object.entries(projectBreakdown).map(
									([project, hours]) => (
										<motion.div
											key={project}
											initial={{ opacity: 0, scale: 0.9 }}
											animate={{ opacity: 1, scale: 1 }}
											className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10"
										>
											<div className="w-2 h-2 rounded-full bg-linear-to-r from-indigo-500 to-purple-500" />
											<span className="text-sm text-slate-500 dark:text-white/70 truncate max-w-37.5">
												{project}
											</span>
											<span className="text-sm font-bold text-slate-900 dark:text-white">
												{hours}h
											</span>
										</motion.div>
									),
								)}
							</div>

							{/* Grand Total & Submit */}
							<div className="flex items-center gap-4 w-full lg:w-auto">
								{/* Grand Total */}
								<div
									className={`flex items-center gap-3 px-6 py-3 rounded-xl ${
										isOvertime
											? "bg-red-500/10 border border-red-500/30"
											: "bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10"
									}`}
								>
									<div>
										<p className="text-xs text-slate-400 dark:text-white/50">
											Grand Total
										</p>
										<p
											className={`text-2xl font-bold ${
												isOvertime
													? "text-red-400"
													: "text-slate-900 dark:text-white"
											}`}
										>
											{totalHours}h
										</p>
									</div>
									{isOvertime && (
										<div className="flex items-center gap-1 text-red-400">
											<AlertTriangle className="w-5 h-5" />
											<span className="text-sm font-medium">
												+{totalHours - 40}h overtime
											</span>
										</div>
									)}
								</div>

								{/* Submit Button */}
								<motion.button
									whileHover={{
										scale: isSubmitted ? 1 : 1.02,
									}}
									whileTap={{ scale: isSubmitted ? 1 : 0.98 }}
									onClick={handleSubmit}
									disabled={isSubmitted || totalHours === 0}
									className={`relative overflow-hidden flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-white transition-all duration-300 ${
										isSubmitted
											? "bg-emerald-500/20 border border-emerald-500/30 cursor-not-allowed"
											: "bg-linear-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50"
									} disabled:opacity-50 disabled:cursor-not-allowed`}
								>
									{!isSubmitted && (
										<motion.div
											className="absolute inset-0 bg-linear-to-r from-white/0 via-white/20 to-white/0"
											animate={{ x: ["-100%", "100%"] }}
											transition={{
												duration: 2,
												repeat: Infinity,
												ease: "linear",
											}}
										/>
									)}
									{isSubmitted ? (
										<>
											<Check className="w-5 h-5" />
											<span>Submitted</span>
										</>
									) : (
										<>
											<Sparkles className="w-5 h-5" />
											<span>Submit for Approval</span>
										</>
									)}
								</motion.button>
							</div>
						</div>
					</div>
				</footer>
			</div>

			{/* Toast */}
			<Toast
				message="Timesheet submitted successfully!"
				show={showToast}
				onClose={() => setShowToast(false)}
			/>
		</div>
	)
}

export default App
