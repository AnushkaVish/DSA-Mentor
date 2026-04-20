import React from "react";

function Leaderboard() {
    return (
        <div className="min-h-screen bg-gray-900 text-white flex justify-center items-center p-4">
            <div className="border border-gray-700 rounded-lg p-8 shadow-lg text-center max-w-2xl w-full bg-gray-800">
                <h1 className="text-3xl font-bold mb-4">
                    🏆 Leaderboard <span className="text-green-400">Coming Soon</span>
                </h1>

                <p className="text-xl text-gray-300 mb-6">
                    Track your progress, climb the ranks, and see how you stack up against other coders in the community.
                </p>

                {/* Leaderboard Preview Placeholder */}
                <div className="bg-gray-700 p-6 rounded-lg shadow-inner mb-6">
                    <h4 className="text-lg font-semibold mb-2">📊 Top Performers</h4>
                    <p className="text-gray-400 mb-4">The leaderboard will showcase:</p>
                    <div className="text-4xl font-bold text-blue-400 mb-2">Coming Soon</div>
                    <small className="text-gray-500">(Fastest submissions, highest scores, and more)</small>
                </div>

                {/* Motivational Quote */}
                <blockquote className="text-center mt-6 border-l-4 border-gray-600 pl-4 italic text-gray-400">
                    <p className="mb-2">"Great coders aren't born—they're built, one challenge at a time."</p>
                    <footer className="text-sm text-gray-500">- Code & Conquer</footer>
                </blockquote>

                {/* Call to Action */}
                <div className="mt-8">
                    <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded transition duration-300">
                        📬 Notify Me When It's Live
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Leaderboard;
