import NoneLogo from '/none-img/none-logo.png';

export const StockTutorialSelection = () => {
  return (
    <div>
      <div>
        <div>
          <h1>주식 튜토리얼</h1>
          <p>주식에 익숙하지 않은 당식을 위하여여</p>
          <span>주식에 익숙하지 않은 당식을 위하여여</span>
          <p>
            먼저 경험하고 싶은 <span>카테고리</span>를 골라볼까요?
          </p>
        </div>
        <div>{/* 카테고리 선택 */}</div>
      </div>
      <div>
        <img src={NoneLogo} alt="" />
      </div>
    </div>
  );
};
