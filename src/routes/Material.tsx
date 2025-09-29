import MaterialList from '@/components/material/list';

export function Material() {
  return (
    <div className='h-full'>
      <div className='flex flex-col h-[calc(100vh-64px)] px-[60px] py-[46px] flex-1'>
        <MaterialList />
      </div>
    </div>
  );
}
