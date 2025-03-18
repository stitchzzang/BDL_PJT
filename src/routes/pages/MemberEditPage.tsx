export const MemberEditPage = () => {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">프로필 수정</h1>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="name">이름</label>
          <input type="text" id="name" />
          <button className="btn-primary">수정</button>
        </div>
      </div>
    </div>
  );
};
