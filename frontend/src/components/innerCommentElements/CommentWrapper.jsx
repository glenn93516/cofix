// Roll : Comment 컨테이너에서 Avatar, NickName, Comment를 하나로 묶어서 표현하는 UI

import React, { useState } from 'react';
import styled from 'styled-components';

// components
import UserAvatar from '../innerCommentElements/UserAvatar';
import UserComment from '../innerCommentElements/UserComment';
import UserNickName from '../innerCommentElements/UserNickName';

const S = {
  CommentWrapper: styled.div`
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    width: 400px;
    height: fit-content;
    padding: 0 20px;
    margin-bottom: 20px;
  `,
  TopPart: styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-basis: 30%;
    margin-bottom: 10px;
  `,
  BottomPart: styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    flex-basis: 65%;
    background-color: transparent;
    height: fit-content;
  `,
  AgreeButton: styled.button`
    outline: none;
    border: 3px solid #14880c;
    border-radius: 20px;
    text-align: center;
    padding: 2px 10px;
    color: ${({ isToggle }) => (isToggle ? 'white' : '#14880c')};
    background-color: ${({ isToggle }) => (!isToggle ? 'white' : '#14880c')};
    font-family: 'SCD_bold';
    font-size: 12px;
    font-weight: bold;
    justify-items: flex-end;
    cursor: pointer;
    &:hover {
      color: white;
      background-color: #1fb614;
    }
  `,
  TopLeft: styled.div`
    display: flex;
    align-items: center;
  `,
};

function CommentWrapper({ userId, comment }) {
  const [isAgree, setIsAgree] = useState(false);
  const onHandleClick = () => {
    setIsAgree((prev) => !prev);
    // Agree 요청.
  };
  return (
    <S.CommentWrapper>
      <S.TopPart>
        <S.TopLeft>
          <UserAvatar />
          <UserNickName nickname={comment.nickname} />
        </S.TopLeft>
        <S.AgreeButton
          data-user-id={userId}
          onClick={() => onHandleClick()}
          isAgree={isAgree}
        >
          Agree
        </S.AgreeButton>
      </S.TopPart>
      <S.BottomPart>
        <UserComment comment={comment.content} />
      </S.BottomPart>
    </S.CommentWrapper>
  );
}

export default CommentWrapper;
