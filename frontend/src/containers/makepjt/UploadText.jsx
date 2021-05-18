import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import InputForm from '../../components/common/InputForm';
import BasicButton from '../../components/common/BasicButton';
import Papers from '../../assets/Paper.png';

export default function UploadText({ onHandleSubmit, value, onValueChange }) {
  const [length, setLength] = useState(0);

  const CalculateLength = (content) => {
    setLength(content.length);
  };

  useEffect(() => {
    CalculateLength(value);
  }, [value]);

  return (
    <>
      <ContainerFrame>
        <LeftFrame>
          <LeftTitleFrame>
            <InputLabel>첨삭할 파일을</InputLabel>
            <InputLabel>입력해주세요.</InputLabel>
          </LeftTitleFrame>
          <LeftImgFrame src={Papers} alt="" />
        </LeftFrame>
        <RightFrame>
          <TextArea
            value={value}
            onChange={(e) => {
              onValueChange(e);
            }}
            autoCapitalize={'none'}
            autoFocus={'off'}
            required={true}
          />
          <Bottom>
            <BasicButton
              text={'시작하기'}
              width={400}
              fontSize={20}
              height={50}
              backgroundColor={'#FE8D8D'}
              margin={30}
              onClickHandler={onHandleSubmit}
            ></BasicButton>
            <CalCulate>
              <CalBlock>{length} 자</CalBlock>
            </CalCulate>
          </Bottom>
        </RightFrame>
      </ContainerFrame>
    </>
  );
}

const ContainerFrame = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  padding-top: 86px;
  padding-bottom: 50px;
  /* justify-content: center;
  align-items: center; */
  animation-duration: 1s;
  animation-name: fadeInUp;
  @keyframes fadeInUp {
    from {
      transform: translate3d(0, 50px, 0);
      opacity: 0;
    }

    to {
      transform: translate3d(0, 0, 0);
      opacity: 1;
    }
  }
  @media only screen and (max-width: 1024px) {
    flex-direction: column;
    align-items: center;
    padding-bottom: 15px;
  }
`;
const InputLabel = styled.div`
  font-size: 45px;
  font-weight: bold;
  font-family: 'S-CoreDream-6Bold';
  color: black;
  margin: 10px;
  word-break: keep-all;
  text-align: center;
`;
const LeftFrame = styled.div`
  width: 50%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  padding-top: 100px;
  padding-bottom: 30px;
  @media only screen and (max-width: 1024px) {
    width: 100%;
    height: 30%;
    justify-content: center;
  }
`;
const LeftTitleFrame = styled.div`
  width: 50%;
  height: 50%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  @media only screen and (max-width: 1024px) {
    width: 100%;
    height: 30%;
    justify-content: center;
  }
`;
const LeftImgFrame = styled.img`
  width: 80%;
  display: flex;
  object-fit: contain;
  margin: auto;
  padding-top: 50px;
  @media only screen and (max-width: 1024px) {
    display: none;
  }
`;

const RightFrame = styled.div`
  position: relative;
  width: 70%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  padding-top: 50px;
  @media only screen and (max-width: 1024px) {
    width: 100%;
    height: 70%;
  }
`;
const TextArea = styled.textarea`
  border: none;
  width: 90%;
  margin: 0 auto;
  height: 80%;
  font-size: 15px;
  padding: 20px;
  font-family: 'S-CoreDream-5Medium';
  border-radius: 15px;
  box-shadow: 3px 6px 3px rgba(0, 0, 0, 0.1);
  resize: none;
  &:focus {
    outline: none;
  }
  @media only screen and (max-width: 1024px) {
    height: 90%;
  }
`;

const Bottom = styled.div`
  position: relative;
  width: 90%;
  display: flex;
  justify-content: center;
  align-items: center;
`;
const CalCulate = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  right: 5%;
  padding: 10px 50px;
  box-shadow: 3px 6px 3px rgba(0, 0, 0, 0.1);
  background-color: #ffffff;
  border-radius: 15px;
`;

const CalBlock = styled.div`
  font-size: 24px;
  font-weight: bold;
`;
