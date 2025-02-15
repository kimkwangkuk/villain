export const PrimaryButton = ({ children, ...props }) => (
  <button
    {...props}
    className="text-[15px] bg-black text-white px-[9px] py-[6px] rounded-[8px] font-semibold hover:bg-gray-800"
  >
    {children}
  </button>
);

export const SecondaryButton = ({ children, ...props }) => (
  <button
    {...props}
    className="bg-blue-500 text-white px-4 py-2 rounded-xl font-semibold hover:bg-blue-600"
  >
    {children}
  </button>
);

export const LineButton = ({ children, ...props }) => (
  <button
    {...props}
    className="text-[15px] text-gray-700 hover:text-gray-900 px-[9px] py-[6px] rounded-[8px] border border-gray-200 hover:border-gray-300 font-semibold"
  >
    {children}
  </button>
); 