import React, { useState } from 'react';
import { courses } from '../utils/constants';
import CourseCard from '../components/coursePage/CourseCard';
import { BookOpenIcon, InformationCircleIcon } from '../components/Icons/CoursesPageIcons';

const CoursesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' ||
                          (filterType === 'free' && course.isFree) ||
                          (filterType === 'paid' && !course.isFree);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen text-slate-100 py-8 md:py-12 bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-12 text-center">
          <BookOpenIcon className="w-20 h-20 mx-auto text-lime-400 mb-4 animate-pulse" />
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-lime-300 to-emerald-500">
            Master New Skills
          </h1>
          <p className="mt-4 text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Dive into our extensive library of coding courses, crafted to elevate your expertise from beginner to advanced.
          </p>
        </header>

        {/* Filters and Search */}
        <div className="mb-10 p-7 bg-gray-800 border border-gray-700 rounded-xl shadow-lg flex flex-col md:flex-row items-center gap-5 backdrop-filter backdrop-blur-sm bg-opacity-70">
          <input
            type="text"
            placeholder="Search for courses by title or keyword..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-grow w-full md:w-auto bg-gray-700 text-white placeholder-gray-400 border border-gray-600 rounded-lg py-3 px-5 focus:ring-2 focus:ring-lime-500 focus:border-lime-500 transition duration-300 ease-in-out"
          />
          <div className="flex space-x-3">
            {(['all', 'free', 'paid']).map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`py-3 px-6 rounded-lg font-semibold transition duration-300 ease-in-out transform hover:scale-105 ${
                  filterType === type
                    ? 'bg-lime-600 text-white shadow-md'
                    : 'bg-gray-600 text-gray-200 hover:bg-gray-500'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)} Courses
              </button>
            ))}
          </div>
        </div>

        {/* Courses Grid */}
        {filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-gray-800 border border-gray-700 rounded-xl shadow-lg backdrop-filter backdrop-blur-sm bg-opacity-70">
            <InformationCircleIcon className="w-20 h-20 mx-auto text-orange-500 mb-6 drop-shadow-lg" />
            <h3 className="text-3xl font-bold text-white mb-3 tracking-wide">Oops! No Courses Found</h3>
            <p className="text-slate-400 text-lg max-w-md mx-auto">
              It looks like there are no courses matching your current search criteria "<span className="font-semibold text-lime-400">{searchTerm || 'empty'}</span>" and filter "<span className="font-semibold text-lime-400">{filterType}</span>".
            </p>
            <p className="text-md text-slate-500 mt-4">
              Try refining your search terms or broadening your filter selections to discover more courses.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoursesPage;