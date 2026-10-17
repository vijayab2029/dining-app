function MenuItemCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="border border-gray-200 rounded-md p-4 shadow-sm bg-white animate-pulse"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="h-4 w-2/3 rounded bg-gray-200" />
        <div className="h-4 w-4 rounded bg-gray-200" />
      </div>

      <div className="flex gap-1 mt-3">
        <div className="h-5 w-16 rounded-full bg-gray-100" />
        <div className="h-5 w-12 rounded-full bg-gray-100" />
      </div>

      <div className="flex flex-col gap-2 mt-4">
        {[0, 1, 2, 3, 4].map((row) => (
          <div key={row} className="flex justify-between">
            <div className="h-3 w-1/3 rounded bg-gray-100" />
            <div className="h-3 w-10 rounded bg-gray-100" />
          </div>
        ))}
      </div>

      <div className="h-6 w-6 rounded-full bg-gray-200 mt-4" />
    </div>
  );
}

export default MenuItemCardSkeleton;
