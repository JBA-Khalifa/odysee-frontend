import { connect } from 'react-redux';
import {
  doResolveUris,
  makeSelectClaimForUri,
  makeSelectIsUriResolving,
  makeSelectTagInClaimOrChannelForUri,
  parseURI,
} from 'lbry-redux';
import { makeSelectWinningUriForQuery } from 'redux/selectors/search';
import WunderbarTopSuggestion from './view';
import { PREFERENCE_EMBED } from 'constants/tags';

const select = (state, props) => {
  const uriFromQuery = `lbry://${props.query}`;

  let uris = [uriFromQuery];
  try {
    const { isChannel } = parseURI(uriFromQuery);

    if (!isChannel) {
      const channelUriFromQuery = `lbry://@${props.query}`;
      uris.push(channelUriFromQuery);
    }
  } catch (e) {}

  const resolvingUris = uris.some((uri) => makeSelectIsUriResolving(uri)(state));
  const winningUri = makeSelectWinningUriForQuery(props.query)(state);
  const winningClaim = winningUri ? makeSelectClaimForUri(winningUri)(state) : undefined;
  const preferEmbed = makeSelectTagInClaimOrChannelForUri(winningUri, PREFERENCE_EMBED)(state);

  return { resolvingUris, winningUri, winningClaim, uris, preferEmbed };
};

export default connect(select, {
  doResolveUris,
})(WunderbarTopSuggestion);
