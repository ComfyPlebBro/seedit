import { timeFilterNames, TimeFilterKey } from '../../hooks/use-time-filter';

export type ParamsType = {
  accountCommentIndex?: string;
  authorAddress?: string;
  commentCid?: string;
  subplebbitAddress?: string;
  timeFilterName?: string;
};

export type ViewType = 'home' | 'pending' | 'post' | 'submit' | 'subplebbit' | 'subplebbit/submit';

const sortTypes = ['/hot', '/new', '/active', '/controversialAll', '/topAll'];

export const getAboutLink = (pathname: string, params: ParamsType): string => {
  if (pathname.startsWith(`/p/${params.subplebbitAddress}/c/${params.commentCid}`)) {
    return `/p/${params.subplebbitAddress}/c/${params.commentCid}/about`;
  } else if (pathname.startsWith(`/p/${params.subplebbitAddress}`)) {
    return `/p/${params.subplebbitAddress}/about`;
  } else if (pathname.startsWith('/profile')) {
    return '/profile/about';
  } else if (pathname.startsWith('/u/')) {
    return `/u/${params.authorAddress}/c/${params.commentCid}/about`;
  } else if (pathname.startsWith('/p/all')) {
    return '/p/all/about';
  } else {
    return '/about';
  }
};

export const isAboutView = (pathname: string): boolean => {
  return pathname.endsWith('/about');
};

export const isAllView = (pathname: string): boolean => {
  return pathname.startsWith('/p/all');
};

export const isAllAboutView = (pathname: string): boolean => {
  return pathname === '/p/all/about';
};

export const isAuthorView = (pathname: string): boolean => {
  return pathname.startsWith('/u/');
};

export const isAuthorCommentsView = (pathname: string, params: ParamsType): boolean => {
  return pathname === `/u/${params.authorAddress}/c/${params.commentCid}/comments`;
};

export const isAuthorSubmittedView = (pathname: string, params: ParamsType): boolean => {
  return pathname === `/u/${params.authorAddress}/c/${params.commentCid}/submitted`;
};

export const isHomeView = (pathname: string, params: ParamsType): boolean => {
  return pathname === '/' || sortTypes.includes(pathname) || (timeFilterNames.includes(params.timeFilterName as TimeFilterKey) && !pathname.startsWith('/p/'));
};

export const isHomeAboutView = (pathname: string): boolean => {
  return pathname === '/about';
};

export const isInboxView = (pathname: string): boolean => {
  return pathname.startsWith('/inbox');
};

export const isInboxCommentRepliesView = (pathname: string): boolean => {
  return pathname === `/inbox/commentreplies`;
};

export const isInboxPostRepliesView = (pathname: string): boolean => {
  return pathname === `/inbox/postreplies`;
};

export const isInboxUnreadView = (pathname: string): boolean => {
  return pathname === `/inbox/unread`;
};

export const isPendingView = (pathname: string, params: ParamsType): boolean => {
  return pathname === `/profile/${params.accountCommentIndex}`;
};

export const isPostView = (pathname: string, params: ParamsType): boolean => {
  return params.subplebbitAddress && params.commentCid ? pathname.startsWith(`/p/${params.subplebbitAddress}/c/${params.commentCid}`) : false;
};

export const isProfileView = (pathname: string): boolean => {
  return pathname.startsWith(`/profile`);
};

export const isProfileCommentsView = (pathname: string): boolean => {
  return pathname.startsWith('/profile/comments');
};

export const isProfileSubmittedView = (pathname: string): boolean => {
  return pathname.startsWith('/profile/submitted');
};

export const isProfileDownvotedView = (pathname: string): boolean => {
  return pathname === '/profile/downvoted';
};

export const isProfileUpvotedView = (pathname: string): boolean => {
  return pathname === '/profile/upvoted';
};

export const isSettingsView = (pathname: string): boolean => {
  return pathname === '/settings';
};

export const isSubmitView = (pathname: string): boolean => {
  return pathname === '/submit';
};

export const isSubplebbitView = (pathname: string, params: ParamsType): boolean => {
  return params.subplebbitAddress ? pathname.startsWith(`/p/${params.subplebbitAddress}`) : false;
};

export const isSubplebbitSettingsView = (pathname: string, params: ParamsType): boolean => {
  return params.subplebbitAddress ? pathname === `/p/${params.subplebbitAddress}/settings` : false;
};

export const isSubplebbitSubmitView = (pathname: string, params: ParamsType): boolean => {
  return params.subplebbitAddress ? pathname === `/p/${params.subplebbitAddress}/submit` : false;
};

export const isSubplebbitsView = (pathname: string): boolean => {
  return pathname.startsWith('/communities');
};

export const isSubplebbitsSubscriberView = (pathname: string): boolean => {
  return pathname === '/communities/subscriber';
};

export const isSubplebbitsModeratorView = (pathname: string): boolean => {
  return pathname === '/communities/moderator';
};

export const isSubplebbitsAdminView = (pathname: string): boolean => {
  return pathname === '/communities/admin';
};

export const isSubplebbitsOwnerView = (pathname: string): boolean => {
  return pathname === '/communities/owner';
};

export const isSubplebbitsVoteView = (pathname: string): boolean => {
  return pathname === '/communities/vote';
};

export const isSubplebbitsVotePassedView = (pathname: string): boolean => {
  return pathname === '/communities/vote/passed';
};

export const isSubplebbitsVoteRejectedView = (pathname: string): boolean => {
  return pathname === '/communities/vote/rejected';
};
