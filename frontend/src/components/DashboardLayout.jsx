import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './Header';
import Sidebar from './Sidebar';
import Breadcrumbs from './Common/Breadcrumbs';
import ErrorBoundary from './Common/ErrorBoundary';

function DashboardLayout({ 
    isSidebarExpanded, 
    isSidebarPinned, 
    onToggleSidebarPin, 
    onSidebarEnter, 
    onSidebarLeave 
}) {
    const location = useLocation();
    
    const headerHeightClass = 'h-16';

    const pageVariants = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 },
    };
    const pageTransition = {
        duration: 0.3,
        ease: 'easeInOut',
    };

    return (
        <div className="flex flex-col h-screen bg-light-bg dark:bg-deep-night-blue classic:bg-deep-night-blue text-light-text dark:text-neutral-light classic:text-neutral-light font-inter pt-16">
            <Header heightClass={headerHeightClass} />
            {/* ¡AQUÍ ESTÁ EL TRUCO! Le quitamos el overflow a este div y se lo dejamos solo al main */}
            <div className="flex flex-1 overflow-hidden">
                <Sidebar 
                    isExpanded={isSidebarExpanded}
                    isPinned={isSidebarPinned}
                    onTogglePin={onToggleSidebarPin}
                    onMouseEnter={onSidebarEnter}
                    onMouseLeave={onSidebarLeave}
                />
                <main className="flex-1 flex flex-col p-8 bg-light-bg dark:bg-gray-900 classic:bg-gray-900 overflow-y-auto custom-scrollbar">
                    <Breadcrumbs />
                    <ErrorBoundary>
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={location.pathname}
                                variants={pageVariants}
                                transition={pageTransition}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                className="h-full" // Aseguramos que el contenido pueda ocupar todo el alto
                            >
                                <Outlet />
                            </motion.div>
                        </AnimatePresence>
                    </ErrorBoundary>
                </main>
            </div>
        </div>
    );
}

export default DashboardLayout;