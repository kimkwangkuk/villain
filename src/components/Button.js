export const PrimaryButton = ({ children, ...props }) => (
  <button
    {...props}
    className="text-[15px] bg-black dark:bg-white text-white dark:text-gray-900 px-[9px] py-[6px] rounded-[8px] font-medium hover:bg-gray-800 dark:hover:bg-gray-100 min-w-[50px]"
  >
    {children}
  </button>
);

export const SecondaryButton = ({ children, ...props }) => (
  <button
    {...props}
    className="bg-blue-500 dark:bg-blue-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-blue-600 dark:hover:bg-blue-700"
  >
    {children}
  </button>
);

export const LineButton = ({ children, ...props }) => (
  <button
    {...props}
    className="text-[15px] text-gray-700 dark:text-neutral-300 hover:text-gray-900 dark:hover:text-white px-[9px] py-[6px] rounded-[8px] border border-gray-200 dark:border-neutral-700 hover:border-gray-300 dark:hover:border-neutral-600 font-semibold"
  >
    {children}
  </button>
); 