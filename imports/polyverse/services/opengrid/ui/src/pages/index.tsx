







import React from 'react';
import Head from 'next/head';

const Home: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <Head>
                <title>OpenGrid - Decentralized Compute Mesh</title>
                <meta name="description" content="Submit and monitor AI compute jobs on a decentralized network" />
            </Head>

            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto py-4 px-6 flex justify-between items-center">
                    <h1 className="text-2xl font-bold">OpenGrid</h1>
                    <nav>
                        <a href="#submit" className="text-gray-600 hover:text-gray-900 ml-8">Submit Job</a>
                        <a href="#monitor" className="text-gray-600 hover:text-gray-900 ml-8">Monitor Jobs</a>
                    </nav>
                </div>
            </header>

            <main className="flex-grow max-w-7xl mx-auto py-8 px-6">
                <section id="submit" className="mb-12">
                    <h2 className="text-3xl font-bold mb-6">Submit a New Job</h2>
                    <div className="bg-white p-6 rounded-lg shadow">
                        {/* Job submission form would go here */}
                        <p>Upload your job YAML file and submit to the network.</p>
                    </div>
                </section>

                <section id="monitor" className="mb-12">
                    <h2 className="text-3xl font-bold mb-6">Monitor Running Jobs</h2>
                    <div className="bg-white p-6 rounded-lg shadow">
                        {/* Job monitoring interface would go here */}
                        <p>View the status of your submitted jobs and track progress.</p>
                    </div>
                </section>

                <section id="providers" className="mb-12">
                    <h2 className="text-3xl font-bold mb-6">Provider Earnings</h2>
                    <div className="bg-white p-6 rounded-lg shadow">
                        {/* Provider earnings dashboard would go here */}
                        <p>Track your earnings as a compute provider.</p>
                    </div>
                </section>
            </main>

            <footer className="bg-white py-4 px-6 border-t border-gray-200">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <p>&copy; {new Date().getFullYear()} OpenGrid. All rights reserved.</p>
                    <div>
                        <a href="#" className="text-gray-600 hover:text-gray-900 ml-4">Docs</a>
                        <a href="#" className="text-gray-600 hover:text-gray-900 ml-4">GitHub</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Home;




