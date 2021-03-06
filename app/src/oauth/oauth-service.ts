import jwt from 'jsonwebtoken';
import axios from 'axios';

import { GITHUB } from './config';

export type ConfigOptions = {
    client_id: string;
    client_secret: string;
    redirect_uri: string;
    auth_url: string;
    token_url: string;
    access_type?: 'online' | 'offline';
};

export interface IOAuth {
    config: ConfigOptions;
    getAuthURL: (options: GetAuthUrlOptions) => string;
    getTokenFromCode: (
        code: string,
        state: string
    ) => Promise<{ response?: any; error?: any }>;
}

export type GetAuthUrlOptions = {
    login_hint?: string;
    scope?: string;
    prompt?: 'consent' | 'none' | 'select_account';
    response_mode?: 'query' | 'fragment' | 'from_post';
    code_challenge_method?: string;
    code_challenge?: string;
    state?: string;
};

export class OAuth implements IOAuth {
    config: ConfigOptions;
    tokenResponse: { [k: string]: any } | undefined;

    constructor(options: ConfigOptions) {
        this.config = options;
    }

    generateNonce() {
        return Math.random().toString(36).substring(7);
    }

    getAuthURL({ scope, state }: GetAuthUrlOptions) {
        const { auth_url: AUTH_URL, client_id, redirect_uri } = this.config;

        const queryParams: string = [
            `client_id=${client_id}`,
            `scope=${scope}`,
            `state=${state}`,
            `redirect_uri=${redirect_uri}`,
        ]
            .filter(Boolean)
            .join('&');

        return `${AUTH_URL}?${queryParams}`;
    }

    async getTokenFromCode(code: string, state: string) {
        const {
            client_id,
            client_secret,
            redirect_uri,
            token_url,
        } = this.config;

        try {
            const response = await axios.post(
                token_url,
                {
                    code: code,
                    client_id: client_id,
                    client_secret: client_secret,
                    state: state,
                    redirect_uri: redirect_uri,
                },
                {
                    headers: {
                        Accept: 'application/json',
                    },
                }
            );
            this.tokenResponse = response.data;
            return { response: response.data };
        } catch (error) {
            return { error };
        }
    }

    refreshToken() {
        const { client_id, client_secret, token_url } = this.config;

        if (this.tokenResponse) {
            return axios.post(client_id, {
                client_id,
                client_secret,
                refresh_token: this.tokenResponse.refresh_token,
            });
        }
    }

    parseResponse(response: string) {
        try {
            return JSON.parse(response);
        } catch (e) {
            console.error(`Error parsing json response: `, e);
        }
    }

    parseJWTToken(token: string) {
        try {
            const decoded = jwt.decode(token);
            return decoded;
        } catch (e) {
            console.error(e);
        }
    }
}

export class GitHubOAuth extends OAuth {
    constructor(options: Partial<ConfigOptions> & { redirect_uri: string }) {
        super({
            client_id: GITHUB.CLIENT_ID,
            client_secret: GITHUB.CLIENT_SECRET,
            auth_url: GITHUB.AUTH_URL,
            token_url: GITHUB.TOKEN_URL,
            ...options,
        });
    }
}
