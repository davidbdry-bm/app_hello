import { Router, Request, Response } from 'express';
import { TokenService } from '../services/tokenService';

export function appRouter(tokenService: TokenService): Router {
  const router = Router();

  router.all('/data/me', async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    const { accessToken } = req.user as any;
    const user = await tokenService.callApi('application/current-user', accessToken);

    if (!user) {
      return res.status(403).json({ error: "Vous n'avez pas les droits pour cette API !" });
    }

    const { firstName, lastName, function: fn } = user.data.attributes;

    return res.json({ firstName, lastName, function: fn ?? '' });
  });

  return router;
}