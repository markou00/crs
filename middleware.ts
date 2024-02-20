import { stackMiddlewares } from '@/middlewares/stackHandler';
import { withNoUser } from '@/middlewares/withNoUser';
import { withUser } from '@/middlewares/withUser';

const middlewares = [withNoUser, withUser];
export default stackMiddlewares(middlewares);
