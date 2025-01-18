export const PrimaryButton = ({ children, ...props }) => (
  <button
    {...props}
    className="bg-black text-white px-3 py-2 rounded-lg font-semibold hover:bg-gray-800"
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