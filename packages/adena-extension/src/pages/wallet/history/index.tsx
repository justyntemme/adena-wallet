import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import Text from '@components/text';
import theme from '@styles/theme';
import { useNavigate } from 'react-router-dom';
import { RoutePath } from '@router/path';
import ListWithDate from '@components/list-box/list-with-date';
import LoadingHistory from '@components/loading-screen/loading-history';
import { useTransactionHistory } from '@hooks/use-transaction-history';
import { HistoryItem } from 'gno-client/src/api/response';
import { useRecoilState } from 'recoil';
import { WalletState } from '@states/index';

const Wrapper = styled.main`
  ${({ theme }) => theme.mixins.flexbox('column', 'flex-start', 'flex-start')};
  width: 100%;
  height: 100%;
  padding-top: 24px;
  padding-bottom: 80px;
  position: relative;
  & .history-title {
    margin-bottom: 12px;
  }
  & .no-transaction {
    position: absolute;
    top: 210px;
    left: 0px;
    width: 100%;
    text-align: center;
  }
`;

export const History = () => {
  const navigate = useNavigate();
  const [transactionHistory] = useRecoilState(WalletState.transactionHistory);
  const [state, setState] = useState(transactionHistory.init ? 'FINISH' : 'LOADING');
  const [getHistory, updateLastHistory, updateNextHistory] = useTransactionHistory();
  const [nextFetch, setNextFetch] = useState(false);
  const [bodyElement, setBodyElement] = useState<HTMLBodyElement | undefined>();
  useEffect(() => {
    initHistory();
  }, [])

  const initHistory = async () => {
    await updateLastHistory();
    setState('FINISH');
  }

  useEffect(() => {
    if (document.getElementsByTagName('body').length > 0) {
      setBodyElement(document.getElementsByTagName('body')[0]);
    }
  }, [document.getElementsByTagName('body')])

  useEffect(() => {
    bodyElement?.addEventListener('scroll', onScrollListener);
    return () => bodyElement?.removeEventListener('scroll', onScrollListener);
  }, [bodyElement]);

  useEffect(() => {
    if (nextFetch) {
      updateNextHistory().then(() =>
        setNextFetch(false))
    }
  }, [nextFetch]);

  const onScrollListener = async () => {
    if (bodyElement) {
      const remain = bodyElement.offsetHeight - bodyElement.scrollTop;
      if (remain < 60 && !nextFetch) {
        setNextFetch(true);
      }
    }
  }

  const onClickHistoryItem = (item: HistoryItem) => {
    navigate(RoutePath.TransactionDetail, { state: item })
  };


  return (
    <Wrapper>
      <Text type='header4' className='history-title'>
        History
      </Text>
      {state === 'FINISH' ? (
        Object.keys(getHistory()).length > 0 ? (
          Object.keys(getHistory()).map((item, idx) => (
            <ListWithDate
              key={idx}
              date={item}
              transaction={getHistory()[item]}
              onClick={onClickHistoryItem}
            />
          ))
        ) : (
          <Text className='no-transaction' type='body1Reg' color={theme.color.neutral[9]}>
            No transaction to display
          </Text>
        )
      ) : (
        <LoadingHistory />
      )}
      <div >

      </div>
    </Wrapper>
  );
};
