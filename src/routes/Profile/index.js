import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import React, { useState, useEffect, createContext } from 'react';
import { useParams } from 'react-router-dom';

import { createFrontendUrl } from '../../utils/api';
import AboutMe from './AboutMe';
import Friends from './Friends';
import Library from './Library';
import ProfileBadge from './ProfileBadge';
import ProfileHeader from './ProfileHeader';
import ProfileOptions from './ProfileOptions';
import RecentActivity from './RecentActivity';
import RecentlyListenedTracks from './RecentlyListenedTracks';
import Shoutbox from './Shoutbox';
import TopArtists from './TopArtists';
import TopTracks from './TopTracks';

export const ProfileContext = createContext(null);

dayjs.extend(relativeTime);

const initialState = {
  recentTracks: [],
  lovedTracks: [],
  friends: [],
  topArtists: {
    overall: [],
    '7days': [],
    '1month': [],
    '3month': [],
    '6month': [],
    '12month': [],
  },
  topTracks: {
    overall: [],
    '7days': [],
    '1month': [],
    '3month': [],
    '6month': [],
    '12month': [],
  },
  name: undefined,
  country: undefined,
  realName: undefined,
  registered: undefined,
  totalPlayCount: undefined,
  img: undefined,
  subscriber: false,
  playlists: undefined,
};

export default function Profile() {
  const { name } = useParams();

  const [profile, setProfile] = useState(initialState);

  useEffect(() => {
    const fields = { name };

    Promise.all([
      fetch(createFrontendUrl('getInfo', fields)),
      fetch(createFrontendUrl('getRecentTracks', fields)),
      fetch(createFrontendUrl('getLovedTracks', fields)),
      fetch(createFrontendUrl('getFriends', fields)),
      fetch(createFrontendUrl('getTopArtists', fields)),
      fetch(createFrontendUrl('getTopTracks', fields)),
    ])

      .then(responses =>
        Promise.all(responses.map(response => response.json())),
      )

      .then(
        ([info, recentTracks, lovedTracks, friends, topArtists, topTracks]) => {
          setProfile({
            recentTracks,
            lovedTracks,
            friends,
            topArtists,
            topTracks,
            ...info,
          });
        },
      )
      .catch(console.error);
  }, [name]);

  if (!profile.name) {
    return null;
  }

  return (
    <ProfileContext.Provider value={profile}>
      <ProfileHeader />
      <div className="leftCol">
        <div className="leftColWrapper">
          <ProfileBadge />
          <ProfileOptions />
          <RecentlyListenedTracks />
          <Library />
          <TopArtists />
          <TopTracks />
          <Shoutbox />
        </div>
      </div>
      <div className="mpuTop rightCol">
        <AboutMe />
        <RecentActivity />
        <Friends />
      </div>
    </ProfileContext.Provider>
  );
}
