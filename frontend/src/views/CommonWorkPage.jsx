import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { saveRoomInfo, resetRoomInfo } from '../modules/actions/roomActions';
import { commentSetAction } from '../modules/actions/commentActions';
import { getRoomInfo, closeRoom } from '../api/co-fix';
import { modifyDocuments } from '../api/documents';
import { getDocuments } from '../api/documents';
import {
  documentGetAction,
  documentModifyAction,
} from '../modules/actions/documentActions';
import { getAllComments, agreeComment } from '../api/comments.js';

// socket
import SockJS from 'sockjs-client';
import Stomp from 'webstomp-client';

// library
import styled from 'styled-components';
import { Scrollbars } from 'react-custom-scrollbars-2';

// containers
import Participant from '../containers/mypage/Participant';
import DocumentContainer from '../containers/DocumentContainer';
import CommentContainer from '../containers/CommentContainer';

// components
import OpenViduMain from '../openvidu/OpenViduMain';

import useRoomInfo from '../hook/useRoomInfo';

const localStorage = window.localStorage;

export default function CommonWorkPage() {
  const dispatch = useDispatch();
  const { roomId, documentId } = useRoomInfo();
  const sentences = useSelector((state) => {
    return state.document.data;
  });

  const [onFocusedSentence, setOnFocusedSentence] = useState('');

  // socket
  const socket = new SockJS('https://k4b104.p.ssafy.io/api/wss');
  const stompClient = Stomp.over(socket);

  // sentence 클릭 -> comment 조회
  const onHandleClickSentence = (sentenceId) => {
    setOnFocusedSentence(sentenceId);
    getAllComments(
      roomId,
      documentId,
      sentenceId,
      (res) => {
        console.log('아쉬밤', res.data.data);
        dispatch(commentSetAction(res.data.data));
      },
      (error) => {
        console.log(error);
      },
    );
  };

  // agree 요청
  const onHandleClickAgree = (sentenceId, commentId, nickname) => {
    agreeComment(
      roomId,
      documentId,
      sentenceId,
      commentId,
      nickname,
      (res) => {
        console.log(res);
      },
      (error) => {
        console.log(error);
      },
    );
  };

  // socket 테스트
  const testRequest = (sentenceId, modifiedContent) => {
    modifyDocuments(
      roomId,
      documentId,
      sentenceId,
      {
        modifiedContent: modifiedContent,
      },
      (res) => {
        // console.log('반환되는 값입니다. : ', res);
      },
      (error) => {
        console.log(error);
      },
    );
  };

  const onHandleDispatch = (nextSentences) => {
    dispatch(documentModifyAction());
  };

  const connectSocket = () => {
    stompClient.connect(
      {
        nickname: localStorage.getItem('nickname') || '기본 닉네임',
        commentRoomId: roomId,
      },
      (frame) => {
        stompClient.subscribe('/room/' + roomId, (res) => {
          const body = JSON.parse(res.body);
          const modifiedSentence = body.sentence; // 들어오는거 확인
          dispatch(documentModifyAction(modifiedSentence));
          console.log('소켓 수정 :', modifiedSentence);
          return body;
        });
      },
    );
  };

  // redux에 저장되어있는 documentReducer 가져오기
  useEffect(() => {
    getDocuments(
      roomId,
      documentId,
      (response) => {
        dispatch(documentGetAction(response.data.data));
        console.log(response.data.data);
      },
      (error) => {
        console.log(`error`, error);
      },
    );

    connectSocket();
  }, []);

  return (
    <S.CommonWorkPage oncopy="return false" oncut="return false">
      <S.UsableSpace>
        <S.LeftSide>
          <Scrollbars style={{ width: '100%', height: '100%' }}>
            <DocumentContainer
              sentences={sentences}
              testRequest={testRequest}
              onHandleClickSentence={onHandleClickSentence}
            />
          </Scrollbars>
        </S.LeftSide>
        <S.RightSide>
          <Scrollbars style={{ width: '100%', height: '100%' }}>
            <CommentContainer
              sentenceId={onFocusedSentence}
              onHandleClickAgree={onHandleClickAgree}
              onHandleClickSentence={onHandleClickSentence}
            />
          </Scrollbars>
        </S.RightSide>
      </S.UsableSpace>
      {/* <Participant /> */}
      <OpenViduMain />
    </S.CommonWorkPage>
  );
}

const S = {
  CommonWorkPage: styled.div`
    width: 100%;
    height: 100%;
    padding-top: 86px;
    display: flex;
    justify-content: center;
    align-items: center;
  `,
  UsableSpace: styled.div`
    width: 80%;
    height: 90%;
    display: flex;
    justify-content: space-evenly;
  `,
  LeftSide: styled.div`
    flex-basis: 55%;
    box-shadow: 0 0 30px #dddddd;
    border-radius: 20px;
    overflow: hidden;
  `,
  RightSide: styled.div`
    flex-basis: 35%;
    box-shadow: 0 0 30px #dddddd;
    border-radius: 20px;
    overflow: hidden;
  `,
};

const testData = [
  {
    id: 0,
    avatar:
      'https://www.pikpng.com/pngl/m/357-3577415_free-png-download-cat-cute-png-images-background.png',
    nickName: '비와 당신',
    comment: '지금 이 순간, 마법처럼 날 묶어왔던 사슬을 벗어던진다.',
  },
  {
    id: 1,
    avatar:
      'https://www.pikpng.com/pngl/m/357-3577415_free-png-download-cat-cute-png-images-background.png',
    nickName: '비와 당신',
    comment:
      'Lorem ipsum dolor, sit amet consectetur adipisicing elit. Cumque , e.',
  },
  {
    id: 2,
    avatar:
      'https://www.pikpng.com/pngl/m/357-3577415_free-png-download-cat-cute-png-images-background.png',
    nickName: '비와 당신',
    comment:
      'Lorem ipsum dolor, sit amet consectetur adipisicing elit. Cumque , e.',
  },
  {
    id: 3,
    avatar:
      'https://www.pikpng.com/pngl/m/357-3577415_free-png-download-cat-cute-png-images-background.png',
    nickName: '비와 당신',
    comment:
      'Lorem ipsum dolor, sit amet consectetur adipisicing elit. Cumque , e.Lorem ipsum dolor, sit amet consectetur adipisicing elit. Cumque , e.',
  },
];
