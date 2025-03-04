import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import qs from 'qs';

import { selectFilter } from '../redux/filter/selectors';
import { setFilters } from '../redux/filter/slice';
import { selectBalls } from '../redux/balls/selectors';
import { fetchBalls } from '../redux/balls/asyncActions';
import { SearchBallParams } from '../redux/balls/types';
import { SortPopup, BallBlock, LoadingBlock, Pagination, Categories } from '../components';
import { sortList } from '../components/SortPopup';
import errorImg from '../assets/img/error.svg';
import { useAppDispatch } from '../redux/store';

const Home: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const isSearch = React.useRef(false);
  const isMounted = React.useRef(false);
  const { activeCategoryId, sort, currentPage, searchValue } = useSelector(selectFilter);
  const { items, status } = useSelector(selectBalls);
  const selectedSort = sort.sortProperty;
  const balls = items.map((obj: any) => <BallBlock key={obj.id} {...obj} />);
  const skeleton = [...Array(8)].map((_, index) => <LoadingBlock key={index} />);

  const getBalls = async () => {
    const category = activeCategoryId > 0 ? `category=${activeCategoryId}` : '';
    const sortBy = `${selectedSort.replace('-', '')}`;
    const order = `${selectedSort.includes('-') ? `asc` : `desc`}`;
    const search = searchValue ? `&search=${searchValue}` : '';

    dispatch(
      fetchBalls({
        category,
        sortBy,
        order,
        search,
        currentPage: String(currentPage),
      }),
    );
    window.scrollTo(0, 0);
  };
  React.useEffect(() => {
    if (window.location.search) {
      const params = qs.parse(window.location.search.substring(1)) as unknown as SearchBallParams;
      const sort = sortList.find((obj) => obj.sortProperty === params.sortBy);
      dispatch(
        setFilters({
          searchValue: params.search,
          activeCategoryId: Number(params.category),
          currentPage: Number(params.currentPage),
          sort: sort || sortList[0],
        }),
      );
      isSearch.current = true;
    }
  }, []);

  React.useEffect(() => {
    if (isMounted.current) {
      const queryString = qs.stringify({
        activeCategoryId,
        currentPage,
        sortProperty: selectedSort,
      });
      navigate(`?${queryString}`);
    }
    isMounted.current = true;
  }, [activeCategoryId, selectedSort, currentPage]);
  React.useEffect(() => {
    window.scrollTo(0, 0);
    if (!isSearch.current) {
      getBalls();
    }
    isSearch.current = false;
  }, [activeCategoryId, selectedSort, searchValue, currentPage]);

  return (
    <>
      <div className="content__top">
        <Categories />
        <SortPopup />
      </div>
      <h2 className="content__title">ALL BALLS</h2>
      {status === 'error' ? (
        <div className="cart--error">
          <h2>An error has occurred 😕</h2>
          <p>
            Sorry, we couldn't get the balls.
            <br />
            Please try a little later.
          </p>
          <img src={errorImg} alt="Empty cart" />
        </div>
      ) : (
        <div className="content__items">{status === 'success' ? balls : skeleton}</div>
      )}

      <Pagination currentPage={currentPage} />
    </>
  );
};

export default Home;
