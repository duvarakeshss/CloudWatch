// Smooth Navigation Utilities
export const smoothScrollTo = (elementId, offset = 0) => {
  const element = document.getElementById(elementId);
  if (element) {
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  }
};

export const smoothScrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
};

export const smoothNavigate = (navigate, path, options = {}) => {
  const { delay = 0, scrollToTop = true } = options;

  if (delay > 0) {
    setTimeout(() => {
      navigate(path);
      if (scrollToTop) {
        setTimeout(() => smoothScrollToTop(), 100);
      }
    }, delay);
  } else {
    navigate(path);
    if (scrollToTop) {
      setTimeout(() => smoothScrollToTop(), 100);
    }
  }
};

// Enhanced navigation hook
export const useSmoothNavigation = (navigate) => {
  const smoothNavigateTo = (path, options = {}) => {
    smoothNavigate(navigate, path, options);
  };

  const scrollToElement = (elementId, offset = 0) => {
    smoothScrollTo(elementId, offset);
  };

  const scrollToTop = () => {
    smoothScrollToTop();
  };

  return {
    navigate: smoothNavigateTo,
    scrollToElement,
    scrollToTop
  };
};