import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom'; // Changed to react-router-dom
import { APP_ROUTES, courses } from '../utils/constants'; // Ensure courses is correctly imported
import LectureVideoPlayer from '../components/coursePage/LectureVideoPlayer';
import RelatedProblemLink from '../components/coursePage/RelatedProblemLink';
import { VideoCameraIcon, DocumentTextIcon, ChatBubbleLeftEllipsisIcon, PaperClipIcon, ChevronDownIcon, ChevronUpIcon, PuzzlePieceIcon, BookOpenIcon, ArrowLeftIcon, InformationCircleIcon, CheckCircleIcon, CheckBadgeIcon, ArrowRightIcon } from '../components/Icons/CoursesPageIcons';
import Certificate from '../components/Certificate';
import { useSelector } from 'react-redux';
import { Trophy } from 'lucide-react';
import axiosClient from '../utils/axiosClient';

const mockDiscussions = [
  {
    id: 'd1',
    user: { name: 'Alice Wonder', avatarSeed: 'alice' },
    date: '2 days ago',
    text: 'Great explanation of Big O notation! I was always a bit confused about the difference between O(n log n) and O(n^2) in practice, but the examples here made it click.',
    replies: [
      { id: 'r1', user: { name: 'Bob The Builder', avatarSeed: 'bob' }, date: '1 day ago', text: 'Totally agree! The visualization for QuickSort partitioning really helped me too.' },
      { id: 'r2', user: { name: 'Instructor Eve', avatarSeed: 'inst_eve' }, date: '1 day ago', text: 'Glad you found it helpful, Alice! Keep an eye on the attachments for some extra practice problems on complexity analysis.' },
    ]
  },
  {
    id: 'd2',
    user: { name: 'Charlie Code', avatarSeed: 'charlie' },
    date: '5 hours ago',
    text: 'Is there a simpler way to handle state in the React example without using reducers for smaller components? Just curious about best practices for tiny apps.',
  }
];


const CourseContentPage = () => {
  const { courseId, lectureId } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [course, setCourse] = useState(null);
  const [currentLecture, setCurrentLecture] = useState(null);
  const [activeTab, setActiveTab] = useState('description');
  const [isCurriculumSidebarVisible, setIsCurriculumSidebarVisible] = useState(false);
  const [expandedModules, setExpandedModules] = useState({});
  const [completedLectures, setCompletedLectures] = useState({});

  // Load progress from Backend on mount
  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const response = await axiosClient.get(`/api/course-progress/${courseId}`);
        if (response.data && response.data.completedLectures) {
          setCompletedLectures(response.data.completedLectures);
        }
      } catch (err) {
        console.error("Error fetching course progress from backend", err);
        // Fallback to localStorage if backend fails (optional, but good for migration)
        const savedProgress = localStorage.getItem(`course_progress_${courseId}`);
        if (savedProgress) {
          try {
            setCompletedLectures(JSON.parse(savedProgress));
          } catch (e) {
            console.error("Error parsing saved progress", e);
          }
        }
      }
    };
    if (user && courseId) {
      fetchProgress();
    }
  }, [courseId, user]);

  // Save progress to Backend whenever it changes
  useEffect(() => {
    const saveProgress = async () => {
      try {
        await axiosClient.post(`/api/course-progress/${courseId}`, {
          completedLectures
        });
      } catch (err) {
        console.error("Error saving course progress to backend", err);
      }
    };
    
    if (user && courseId && Object.keys(completedLectures).length > 0) {
      saveProgress();
    }
  }, [completedLectures, courseId, user]);

  const TABS_CONFIG = [
    {
      id: 'description',
      name: 'Description',
      icon: DocumentTextIcon,
      renderContent: (lecture) => (
        <div className="prose prose-sm dark:prose-invert text-slate-700 dark:text-slate-300 max-w-none leading-relaxed">
          <p dangerouslySetInnerHTML={{ __html: lecture.snippet?.description.replace(/\n/g, '<br/>') }}></p>
        </div>
      ),
    },
    {
      id: 'discussion',
      name: 'Discussion',
      icon: ChatBubbleLeftEllipsisIcon,
      renderContent: (lecture) => (
        <div>
          <h3 className="text-xl font-bold text-purple-600 dark:text-purple-400 mb-6">Lecture Discussion</h3>
          <div className="space-y-8"> {/* Increased space between discussions */}
            {mockDiscussions.map((thread) => (
              <div key={thread.id} className="p-5 bg-white dark:bg-slate-850 rounded-xl shadow-md border border-slate-200 dark:border-slate-700"> {/* Enhanced card style */}
                <div className="flex items-start space-x-4"> {/* Increased space-x */}
                  <img
                    src={`https://i.pravatar.cc/48?u=${thread.user.avatarSeed}`} 
                    alt={thread.user.name}
                    className="w-12 h-12 rounded-full flex-shrink-0 border-2 border-orange-400 dark:border-orange-500"/> {/* Accent border */}
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-md font-semibold text-orange-600 dark:text-orange-400">{thread.user.name}</span> {/* Prominent orange */}
                      <span className="text-xs text-slate-500 dark:text-slate-400">{thread.date}</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">{thread.text}</p>
                  </div>
                </div>
                {thread.replies && thread.replies.length > 0 && (
                  <div className="ml-16 mt-6 pl-5 border-l-2 border-slate-300 dark:border-slate-700 space-y-5"> {/* Thicker border, increased spacing */}
                    {thread.replies.map(reply => (
                       <div key={reply.id} className="flex items-start space-x-3">
                          <img
                            src={`https://i.pravatar.cc/36?u=${reply.user.avatarSeed}`} 
                            alt={reply.user.name}
                            className="w-9 h-9 rounded-full flex-shrink-0 border border-slate-300 dark:border-slate-600"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">{reply.user.name}</span> {/* Purple for replies */}
                              <span className="text-xs text-slate-500 dark:text-slate-400">{reply.date}</span>
                            </div>
                            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{reply.text}</p>
                          </div>
                      </div>
                    ))}
                  </div>
                )}
                 <button className="mt-5 text-sm font-medium text-orange-600 hover:text-orange-500 dark:text-orange-500 dark:hover:text-orange-400 hover:underline transition-colors ml-16">Reply to thread</button> {/* Consistent styling */}
              </div>
            ))}
          </div>
          <div className="mt-10 pt-8 border-t border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Leave a Comment</h3>
              <textarea
                  className="w-full p-4 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 placeholder-slate-400 dark:placeholder-slate-400 transition-all shadow-sm"
                  rows={4}
                  placeholder={`Ask a question or share your thoughts on "${lecture.snippet?.title}"...`}
              ></textarea>
              <button className="btn btn-primary mt-4 bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 text-white font-bold py-2.5 px-6 rounded-lg shadow-lg transition-all duration-200 ease-in-out">
                  Post Comment
              </button>
          </div>
        </div>
      ),
    },
    {
      id: 'attachments',
      name: 'Attachments',
      icon: PaperClipIcon,
      renderContent: (lecture) => (
        <div>
          <h3 className="text-xl font-bold text-purple-600 dark:text-purple-400 mb-6">Supplementary Materials</h3> {/* More descriptive heading */}
          {lecture.attachments && lecture.attachments.length > 0 ? (
            <ul className="space-y-4">
              {lecture.attachments.map((att, index) => (
                <li key={index} className="bg-white dark:bg-slate-850 p-4 rounded-lg flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800 transition-all group shadow-sm border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center">
                    <PaperClipIcon className="w-6 h-6 text-orange-500 dark:text-orange-400 mr-4 flex-shrink-0 group-hover:text-orange-600 dark:group-hover:text-orange-300"/> {/* Larger icon */}
                    <div>
                      <span className="text-base font-medium text-slate-800 dark:text-slate-100 group-hover:text-purple-600 dark:group-hover:text-purple-400">{att.name}</span> {/* Emphasized name */}
                      <span className="block text-sm text-slate-500 dark:text-slate-400">{att.size}</span>
                    </div>
                  </div>
                  <a href={att.url} download className="text-sm font-semibold text-orange-600 hover:text-orange-700 dark:text-orange-500 dark:hover:text-orange-400 px-3 py-1.5 rounded-md hover:bg-orange-100 dark:hover:bg-slate-750 transition-colors">Download</a>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-10 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-850 rounded-lg shadow-inner border border-slate-200 dark:border-slate-700">
              <InformationCircleIcon className="w-14 h-14 mx-auto mb-4 text-purple-400 dark:text-purple-500"/> {/* Accent color icon */}
              <p className="font-semibold text-lg text-slate-700 dark:text-slate-200">No Attachments Available</p>
              <p className="text-md mt-1">There are no supplementary files for this lecture at the moment.</p>
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'problems',
      name: 'Related Problems',
      icon: PuzzlePieceIcon,
      renderContent: (lecture) => (
        <div>
          <h3 className="text-xl font-bold text-purple-600 dark:text-purple-400 mb-6">Practice Problems</h3>
          {lecture.relatedProblemIds && lecture.relatedProblemIds.length > 0 ? (
            <div className="space-y-4"> {/* Increased space */}
              {lecture.relatedProblemIds.map((problemId) => (
                <RelatedProblemLink key={problemId} problemId={problemId} />
              ))}
            </div>
          ) : (
             <div className="text-center py-10 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-850 rounded-lg shadow-inner border border-slate-200 dark:border-slate-700">
              <PuzzlePieceIcon className="w-14 h-14 mx-auto mb-4 text-orange-400 dark:text-orange-500"/> {/* Accent color icon */}
              <p className="font-semibold text-lg text-slate-700 dark:text-slate-200">No Specific Problems Linked</p>
              <p className="text-md mt-1">Explore the main problem list for general practice exercises.</p>
            </div>
          )}
        </div>
      ),
    },
  ];

  useEffect(() => {
    const getCourse = async () => {
      try {
        let allItems = [];
        let nextPageToken = '';
        do {
          // !!! IMPORTANT: Replace 'YOUR_YOUTUBE_API_KEY' with your actual YouTube Data API v3 key !!!
          const response = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${courseId}&maxResults=50&key=AIzaSyAWIeZWueZ8gC_hlk0q6X6bJJDgr_3W6Ls`);
          const data = await response.json();

          if (data.items) {
            allItems.push(...data.items);
          }
          nextPageToken = data.nextPageToken || '';
        } while (nextPageToken);

        const foundCourse = courses.find(c => c.id === courseId) || null;
        if (foundCourse) {
            // Ensure snippet and title exist for the foundCourse
            foundCourse.snippet = foundCourse.snippet || {};
            foundCourse.snippet.title = foundCourse.snippet.title || foundCourse.title; // Fallback to title if snippet.title is missing
            foundCourse.curriculum = [{ id: "rm1", title: foundCourse.snippet.title, lectures: allItems }]; // Use foundCourse.snippet.title here
            setCourse(foundCourse);

            let lectureFound = false;
            let initialExpandedModules = { ...expandedModules };
            for (const module of foundCourse.curriculum) {
                const lecture = module.lectures.find(l => l.contentDetails?.videoId === lectureId);
                if (lecture) {
                    setCurrentLecture(lecture);
                    initialExpandedModules[module.id] = true;
                    lectureFound = true;
                    break;
                }
            }
            setExpandedModules(initialExpandedModules);
            if (!lectureFound && foundCourse.curriculum?.[0]?.lectures?.[0]) {
                const firstLecture = foundCourse.curriculum[0].lectures[0];
                navigate(APP_ROUTES.courseContent.replace(':courseId', courseId).replace(':lectureId', firstLecture.contentDetails?.videoId), { replace: true });
            }
        } else {
            console.error("Course not found in local data:", courseId);
            setCourse(null);
            setCurrentLecture(null);
        }
      } catch (error) {
        console.error("Error fetching course data:", error);
        setCourse(null); // Set course and lecture to null on error to show loading/not found state
        setCurrentLecture(null);
      }
    };
    getCourse();
  }, [courseId, lectureId, navigate, expandedModules]); // Added expandedModules to dependencies as it's used in the effect


  const toggleModule = (moduleId) => {
    setExpandedModules(prev => ({ ...prev, [moduleId]: !prev[moduleId] }));
  };

  const handleLectureSelect = (newLectureId) => {
    navigate(APP_ROUTES.courseContent.replace(':courseId', courseId).replace(':lectureId', newLectureId));
    if (window.innerWidth < 768) {
      setIsCurriculumSidebarVisible(false);
    }
  };

  const toggleLectureComplete = () => {
    if (currentLecture) {
      setCompletedLectures(prev => ({
        ...prev,
        [currentLecture.contentDetails?.videoId]: !prev[currentLecture.contentDetails?.videoId]
      }));
    }
  };


  if (!course || !currentLecture) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-white p-6">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500 mb-4"></div> {/* Thicker spinner */}
        <p className="text-xl font-bold text-slate-800 dark:text-white mb-2">Loading Course Content...</p>
        <p className="text-md text-slate-600 dark:text-slate-400 text-center max-w-md">Please wait a moment while we fetch the lecture details, or check if the course/lecture exists and your API key is correct.</p>
      </div>
    );
  }

  const lectureIndexInfo = (() => {
    let currentLectureIndex = -1;
    const flatLectures = [];
    course.curriculum.forEach(module => module.lectures.forEach(lec => flatLectures.push(lec)));
    const totalLecturesInCourse = flatLectures.length;

    let prevLectureId = null;
    let nextLectureId = null;

    for (let i = 0; i < totalLecturesInCourse; i++) {
      if (flatLectures[i].contentDetails?.videoId === currentLecture.contentDetails?.videoId) {
        currentLectureIndex = i;
        if (i > 0) prevLectureId = flatLectures[i - 1].contentDetails?.videoId;
        if (i < totalLecturesInCourse - 1) nextLectureId = flatLectures[i + 1].contentDetails?.videoId;
        break;
      }
    }
    return { currentLectureIndex, totalLecturesInCourse, prevLectureId, nextLectureId };
  })();

  const activeTabConfig = TABS_CONFIG.find(t => t.id === activeTab);

  const completedCount = Object.values(completedLectures).filter(Boolean).length;
  // Make completion check more robust
  const isCourseFullyCompleted = lectureIndexInfo.totalLecturesInCourse > 0 && completedCount >= lectureIndexInfo.totalLecturesInCourse;
  const courseProgress = lectureIndexInfo.totalLecturesInCourse > 0
    ? (completedCount / lectureIndexInfo.totalLecturesInCourse) * 100
    : 0;

  return (
    <div className="flex flex-col md:flex-row h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 overflow-hidden relative">
      <main className="flex-1 md:w-2/3 flex flex-col overflow-y-auto custom-scrollbar bg-white dark:bg-slate-950 max-h-screen"> {/* Custom scrollbar class */}
        <header className="p-4 md:p-6 border-b-2 border-slate-200 dark:border-slate-800 flex-shrink-0 sticky top-0 bg-white dark:bg-slate-950 z-20 shadow-lg"> {/* Stronger border, shadow */}
          <div className="flex items-center justify-between">
            <div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-purple-700 dark:text-purple-400 truncate leading-tight">{currentLecture.snippet?.title}</h1> {/* Purple heading, larger */}
                <div className="flex items-center gap-4 mt-1">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                      Part of: <Link to={APP_ROUTES.courseOverview.replace(':courseId', course.id)} className="text-orange-600 dark:text-orange-400 hover:underline hover:text-orange-700 dark:hover:text-orange-300 font-medium">{course.snippet?.title}</Link> {/* Orange link */}
                  </p>
                  <div className="flex items-center gap-2 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 rounded-full border border-purple-200 dark:border-purple-800">
                    <div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500 transition-all duration-500" style={{ width: `${courseProgress}%` }}></div>
                    </div>
                    <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400">{Math.round(courseProgress)}%</span>
                  </div>
                </div>
            </div>
            <button
              onClick={() => setIsCurriculumSidebarVisible(!isCurriculumSidebarVisible)}
              className="md:hidden p-3 text-slate-600 dark:text-slate-300 hover:text-orange-600 dark:hover:text-orange-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500 rounded-lg transition-colors"
              aria-label="Toggle curriculum"
              aria-expanded={isCurriculumSidebarVisible}
            >
              <BookOpenIcon className="w-7 h-7" /> {/* Larger icon */}
            </button>
          </div>
        </header>

        <div className="p-4 md:p-8 flex-grow"> {/* Increased padding */}
          <LectureVideoPlayer videoUrl={`https://www.youtube.com/embed/${currentLecture.contentDetails?.videoId}`} title={currentLecture.snippet?.title} />

          {/* Certificate Section for 100% completion */}
          {isCourseFullyCompleted && (
            <div className="mt-8 p-8 bg-gradient-to-br from-purple-900/40 to-slate-900/40 border-2 border-orange-500/30 rounded-3xl backdrop-blur-xl flex flex-col items-center text-center shadow-2xl animate-fadeIn">
              <div className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-orange-500/20">
                <Trophy size={40} className="text-white" />
              </div>
              <h2 className="text-3xl font-black text-white mb-2">Congratulations, Champion! 🎊</h2>
              <p className="text-slate-400 max-w-lg mb-8">
                You have officially mastered all the concepts in <span className="text-orange-400 font-bold">{course.snippet?.title}</span>. 
                Your dedication has paid off. It's time to claim your well-deserved certification!
              </p>
              <Certificate 
                userName={`${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Valued Student'}
                courseName={course.snippet?.title}
                date={new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
              />
            </div>
          )}

          <div className="mt-6 md:mt-8 flex flex-wrap justify-center items-center gap-4"> {/* Centered buttons, increased gap */}
             <button
                onClick={lectureIndexInfo.prevLectureId ? () => handleLectureSelect(lectureIndexInfo.prevLectureId) : undefined}
                disabled={!lectureIndexInfo.prevLectureId}
                className={`flex items-center px-6 py-3 rounded-full text-lg font-semibold transition-all duration-300
                  ${!lectureIndexInfo.prevLectureId
                    ? 'bg-slate-300 dark:bg-slate-700 text-slate-500 cursor-not-allowed opacity-60'
                    : 'bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 shadow-md hover:shadow-lg ring-1 ring-slate-300 dark:ring-slate-700 hover:ring-orange-400'
                  }`}
              >
                 <ArrowLeftIcon className="w-5 h-5 mr-2" /> Previous Lecture
              </button>

            <button
                onClick={toggleLectureComplete}
                className={`flex items-center min-w-[220px] px-7 py-3 rounded-full text-lg font-bold transition-all duration-300 ease-in-out shadow-lg transform hover:scale-105
                ${completedLectures[currentLecture.contentDetails?.videoId]
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white'
                    : 'bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 text-white'
                }`}
              >
                {completedLectures[currentLecture.contentDetails?.videoId] ?
                  <CheckBadgeIcon className="w-6 h-6 mr-2" /> :
                  <CheckCircleIcon className="w-6 h-6 mr-2 opacity-80" />
                }
                {completedLectures[currentLecture.contentDetails?.videoId] ? 'Lecture Completed!' : 'Mark as Complete'}
            </button>

             <button
                onClick={lectureIndexInfo.nextLectureId ? () => handleLectureSelect(lectureIndexInfo.nextLectureId) : undefined}
                disabled={!lectureIndexInfo.nextLectureId}
                className={`flex items-center px-6 py-3 rounded-full text-lg font-semibold transition-all duration-300
                  ${!lectureIndexInfo.nextLectureId
                    ? 'bg-slate-300 dark:bg-slate-700 text-slate-500 cursor-not-allowed opacity-60'
                    : 'bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 shadow-md hover:shadow-lg ring-1 ring-slate-300 dark:ring-slate-700 hover:ring-purple-400'
                  }`}
              >
                Next Lecture <ArrowRightIcon className="w-5 h-5 ml-2" />
              </button>
          </div>

          <div className="mt-8 md:mt-12 bg-white dark:bg-slate-900 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800"> {/* Elevated tab content area */}
            <div className="border-b-2 border-slate-200 dark:border-slate-700 mb-6"> {/* Thicker border */}
              <nav className="-mb-px flex space-x-3 sm:space-x-6 overflow-x-auto" aria-label="Tabs"> {/* Increased spacing */}
                {TABS_CONFIG.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`whitespace-nowrap py-3.5 px-3 sm:px-5 border-b-3 font-medium text-base flex items-center transition-all duration-200 ease-in-out rounded-t-lg
                      ${activeTab === tab.id
                        ? 'border-orange-500 text-orange-600 dark:text-orange-400 bg-orange-500/15 dark:bg-slate-800/70'
                        : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 hover:border-purple-300 dark:hover:border-purple-600 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                      }`}
                    aria-current={activeTab === tab.id ? 'page' : undefined}
                  >
                    <tab.icon className={`w-5 h-5 mr-2 ${activeTab === tab.id ? 'text-orange-500' : 'text-slate-400 dark:text-slate-500 group-hover:text-purple-500 dark:group-hover:text-purple-400'}`} />
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>

            <div key={activeTab} className="py-4 animate-fadeIn">
              {activeTabConfig ? activeTabConfig.renderContent(currentLecture) : null}
            </div>
          </div>
        </div>
      </main>

      <aside className={`
        fixed inset-y-0 right-0 z-30 w-full max-w-xs sm:max-w-sm
        transform transition-transform duration-300 ease-in-out
        bg-slate-50 dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden
        md:static md:w-1/3 md:max-w-none ${isCurriculumSidebarVisible ? 'translate-x-0' : 'translate-x-full'} md:translate-x-0 md:flex-shrink-0 md:z-auto shadow-xl
      `}>
        <div className="p-4 md:p-6 border-b border-slate-200 dark:border-slate-700 flex-shrink-0 sticky top-0 bg-slate-50 dark:bg-slate-800 z-10 shadow-sm">
            <div className="flex items-center justify-between mb-3">
                <Link to={APP_ROUTES.courseOverview.replace(':courseId', course.id)} className="flex items-center text-purple-600 hover:text-purple-700 dark:hover:text-purple-400 group transition-colors">
                    <BookOpenIcon className="w-6 h-6 mr-2 group-hover:text-purple-700 dark:group-hover:text-purple-400"/>
                    <h2 className="text-lg md:text-xl font-bold truncate group-hover:text-purple-700 dark:group-hover:text-purple-400">{course.snippet?.title}</h2> {/* Purple course title */}
                </Link>
                <button
                    onClick={() => setIsCurriculumSidebarVisible(false)}
                    className="md:hidden text-slate-500 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 p-2 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500 rounded-md transition-colors"
                    aria-label="Close curriculum"
                >
                    <ChevronUpIcon className="w-6 h-6 transform rotate-90"/>
                </button>
            </div>

            { lectureIndexInfo.totalLecturesInCourse > 0 && (
                <div>
                    <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400 mb-2 font-medium">
                        <span>Course Progress</span>
                        <span>{completedCount} / {lectureIndexInfo.totalLecturesInCourse} lectures</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 shadow-inner"> {/* Thicker progress bar */}
                        <div className="bg-gradient-to-r from-green-400 to-teal-500 h-2.5 rounded-full transition-all duration-300 ease-out" style={{ width: `${courseProgress}%` }}></div> {/* Gradient progress */}
                    </div>
                </div>
            )}
        </div>

        <nav className="flex-1 py-3 overflow-y-auto custom-scrollbar"> {/* Custom scrollbar class */}
          {course.curriculum.map((module) => (
            <div key={module.id} className="mb-1.5"> {/* Increased margin bottom */}
              <button
                onClick={() => toggleModule(module.id)}
                className="w-full flex justify-between items-center px-4 py-3 text-base font-semibold text-left text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors rounded-lg mx-2"
                aria-expanded={expandedModules[module.id]}
                aria-controls={`module-lectures-${module.id}`}
              >
                <span className="truncate">{module.title}</span>
                <ChevronDownIcon className={`w-5 h-5 text-purple-500 dark:text-purple-400 transform transition-transform duration-300 ${expandedModules[module.id] ? 'rotate-180' : '' }`} />
              </button>
              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedModules[module.id] ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}`}> {/* Smooth expand/collapse */}
                <ul id={`module-lectures-${module.id}`} className="pl-6 border-l-2 border-orange-300 dark:border-orange-600 ml-6 py-2 mt-2 space-y-1"> {/* Orange border */}
                  {module.lectures.map((lecture) => (
                    <li key={lecture.contentDetails?.videoId}>
                      <button
                        onClick={() => handleLectureSelect(lecture.contentDetails?.videoId)}
                        className={`w-full text-left px-4 py-2 text-sm rounded-lg transition-all duration-200 my-0.5 group flex items-center
                          ${lecture.contentDetails?.videoId === currentLecture.contentDetails?.videoId
                            ? 'bg-gradient-to-r from-orange-500 to-purple-600 text-white font-bold shadow-md ring-2 ring-orange-400' // Gradient for active
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-orange-600 dark:hover:text-orange-400'
                          }`}
                        aria-current={lecture.contentDetails?.videoId === currentLecture.contentDetails?.videoId ? "page" : undefined}
                      >
                        {completedLectures[lecture.contentDetails?.videoId] ? (
                          <CheckBadgeIcon
                            className={`w-4 h-4 mr-2 flex-shrink-0 ${lecture.contentDetails?.videoId === currentLecture.contentDetails?.videoId ? 'text-white' : 'text-green-400 group-hover:text-green-300'}`} />
                        ) : (
                          <VideoCameraIcon className={`w-4 h-4 mr-2 flex-shrink-0 ${lecture.contentDetails?.videoId === currentLecture.contentDetails?.videoId ? 'text-white' : 'text-slate-500 group-hover:text-orange-500 dark:text-slate-400 dark:group-hover:text-orange-400'}`} />
                        )}
                        <span className="truncate">{lecture.snippet?.title}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            
            </div>
          ))}
        </nav>
      </aside>
      
      {isCurriculumSidebarVisible && (
        <div 
            className="fixed inset-0 bg-black/60 z-20 md:hidden backdrop-blur-sm"
            onClick={() => setIsCurriculumSidebarVisible(false)}
            aria-hidden="true"
        ></div>
      )}
    </div>
  );
};

export default CourseContentPage;


