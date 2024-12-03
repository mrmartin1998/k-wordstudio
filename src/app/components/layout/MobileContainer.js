export default function MobileContainer({ children }) {
  return (
    <div className="w-full min-h-screen max-w-lg mx-auto bg-base-100 flex flex-col">
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  );
} 