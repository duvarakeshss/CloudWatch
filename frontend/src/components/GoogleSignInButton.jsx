import React from 'react';

const GoogleSignInButton = ({ onClick, isLoading, text = 'Continue with Google' }) => {
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className="w-full flex justify-center items-center gap-3 py-3 px-4 border border-[var(--border-color)] rounded-lg text-sm font-medium text-[var(--subtle-text-color)] bg-[var(--input-background)] hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary-color)] focus:ring-offset-[var(--background-color)] transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
    >
      {isLoading ? (
        <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
      ) : (
        <svg aria-hidden="true" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.945 11.055h-8.09v3.636h4.59c-.205 1.41-1.636 3.273-4.59 3.273-2.727 0-4.955-2.273-4.955-5.09s2.228-5.09 4.955-5.09c1.5 0 2.59.636 3.182 1.227l2.863-2.863C16.955 4.318 14.864 3 12.045 3 7.045 3 3.09 7.045 3.09 12s3.955 9 8.955 9c5.273 0 8.773-3.636 8.773-8.955 0-.636-.045-1.227-.136-1.99z"></path>
        </svg>
      )}
      {isLoading ? 'Signing in...' : text}
    </button>
  );
};

export default GoogleSignInButton;