import { stackMiddlewares } from '@/middlewares/stackHandler';
import { withUser } from '@/middlewares/withUser';
import { withNoUser } from '@/middlewares/withNoUser';

const middlewares = [withUser, withNoUser];
export default stackMiddlewares(middlewares);
