import client,  { loginRequired, filterFields } from '../utils/GithubApi'
import prompt from '../utils/prompt'
import { autobind } from "core-decorators"
import { SearchUsersResponse, SearchUsersResponseItem } from '../@types/@octokit-rest'
import { ReposGetResponse, UsersGetFollowingForUserResponse, UsersGetFollowingForUserResponseItem, UsersGetFollowersForUserResponse, UsersGetFollowersForUserResponseItem, ActivityGetStarredReposForUserResponse, ActivityGetStarredReposForUserResponseItem } from '@octokit/rest';
import user from './User';

class SearchAction {
    
    async getUsers(q: string, fields: (keyof(SearchUsersResponseItem))[] = []) {
        let { data } = await client.search.users({
            q: q
        })
        let items = (<SearchUsersResponse>data).items
        return filterFields<SearchUsersResponseItem>(items, fields)
    }
    
    async getRepos(username: string) {
        let { data } = await client.repos.getForUser({
            username: username
        })
        return <ReposGetResponse[]>data
    }

    async getFollowings(username: string) {
        let { data } = await client.users.getFollowingForUser({
            username: username
        })
        return <UsersGetFollowingForUserResponse>data
    }

    async getFollowers(username: string) {
        let { data } = await client.users.getFollowersForUser({
            username: username
        })
        return <UsersGetFollowersForUserResponse>data
    }

    async getStars(username: string) {
        let { data } = await client.activity.getStarredReposForUser({
            username: username
        })
        return <ActivityGetStarredReposForUserResponse>data
    }
}

@autobind
class Search {
    action = new SearchAction()

    async user(username?) {
        let result: SearchUsersResponseItem[]
        if (!username || typeof(username) !== 'string') {
            result = []
        } else {
            result = await this.action.getUsers(username, ['id', 'login'])
        }
        let { un } = await prompt([
            {
                type: 'autolist',
                name: 'un',
                message: 'Username: ',
                source: result.map(item => item.login),
                filterTimeout: 3000,
                filterStrategy: async (input) => {
                    if (!input) {
                        return result.map(item => item.login)
                    }
                    let res = await this.action.getUsers(input, ['login'])
                    return res.map(item => item.login)
                }
            }
        ])
        console.log(un)
        let { op } = await prompt([
            {
                type: 'autolist',
                name: 'op',
                message: 'Operates: ',
                source: [
                    'repos',
                    'following',
                    'followers',
                    // 'stars'
                ]
            }
        ])
        if (op === 'repos') {
            let res = await this.action.getRepos(un)
            let re = filterFields<ReposGetResponse>(res, ['id', 'name'])
            console.log(re)
        } else if (op === 'following') {
            let res = await this.action.getFollowings(un)
            let re = filterFields<UsersGetFollowingForUserResponseItem>(res, ['id', 'login'])
            console.log(re)
        } else if (op === 'followers') {
            let res = await this.action.getFollowers(un)
            let re = filterFields<UsersGetFollowersForUserResponseItem>(res, ['id', 'login'])
            console.log(re)
        } else if (op === 'stars') {
            let res = await this.action.getStars(un)
            let re = filterFields<ActivityGetStarredReposForUserResponseItem>(res, ['id', 'name'])
            console.log(re)
        } else {
            process.exit(1)
        }
    }

    async repo(reponame?) {
        if (!reponame || typeof(reponame) !== 'string') {
            reponame = (await prompt([{
                type: 'input',
                name: 'reponame',
                message: 'Reponame: ',
                validate: r => !!r 
            }])).reponame
        }
        console.log(reponame)
    }
}

const search = new Search() 
export default search
