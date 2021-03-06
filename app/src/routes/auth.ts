import express from 'express';
import { GitHubOAuth } from '../oauth/oauth-service';

const router = express.Router();

router.get('/auth-url/:provider', (req, res) => {
    const { provider } = req.params;

    switch (provider) {
        case 'github': {
            const { scope, redirect_uri, state } = req.query as {
                [key: string]: string;
            };

            const url = new GitHubOAuth({ redirect_uri }).getAuthURL({
                state,
                scope,
            });

            res.status(200).send({ url });
        }

        default:
            res.status(400).send();
    }
});

router.get('/auth-from-code/:provider', async (req, res) => {
    const { provider } = req.params;

    switch (provider) {
        case 'github': {
            const { code, redirect_uri, state } = req.query as {
                [key: string]: string;
            };

            const GithubOAuthInstance = new GitHubOAuth({ redirect_uri });

            const {
                response,
                error,
            } = await GithubOAuthInstance.getTokenFromCode(code, state);

            if (error || response.error) {
                res.status((error && error.statusCode) || 500).send({
                    error: error && error.error ? error.errror : response.error,
                });
                return;
            }

            if (response) {
                res.status(200).send({
                    access_token: response.access_token,
                });
                return;
            } else {
                res.status(500).send({
                    error: 'Error getting access token',
                });
                return;
            }
        }

        default:
            res.status(400).send();
    }
});

export default router;
