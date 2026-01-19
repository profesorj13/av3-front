export default function TabsNavbar() {
  return (
    <div className="flex items-center fill-primary rounded-full px-1 py-0.5 max-w-[10.3rem] w-full bg-[#F7F9FD99]">
      <button
        type="button"
        className="rounded-full px-3 py-1.5  cursor-pointer w-full flex-1 body-1-regular text-gray-500"
      >
        Aula
      </button>
      <button
        type="button"
        className="rounded-full px-3 py-1.5  cursor-pointer w-full flex-1 body-1-regular text-gray-500 bg-white/70"
      >
        Docente
      </button>
    </div>
  );
}
