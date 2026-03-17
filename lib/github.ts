import { Octokit } from '@octokit/rest'

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN })
const OWNER = process.env.GITHUB_OWNER!
const REPO = process.env.GITHUB_REPO!

export interface FileContent {
  content: string // decoded UTF-8
  sha: string     // current file blob SHA (needed for updates)
}

export async function readFile(path: string, ref?: string): Promise<FileContent> {
  const { data } = await octokit.repos.getContent({
    owner: OWNER,
    repo: REPO,
    path,
    ...(ref ? { ref } : {}),
  })
  if (Array.isArray(data) || data.type !== 'file') {
    throw new Error(`${path} is not a file`)
  }
  return {
    content: Buffer.from(data.content, 'base64').toString('utf-8'),
    sha: data.sha,
  }
}

export async function writeFile(
  path: string,
  newContent: string,
  currentSha: string,
  message: string
): Promise<string> {
  const { data } = await octokit.repos.createOrUpdateFileContents({
    owner: OWNER,
    repo: REPO,
    path,
    message,
    content: Buffer.from(newContent, 'utf-8').toString('base64'),
    sha: currentSha,
  })
  return data.commit.sha!
}

export async function getLatestCommitSha(): Promise<string> {
  const { data } = await octokit.repos.getBranch({
    owner: OWNER,
    repo: REPO,
    branch: 'main',
  })
  return data.commit.sha
}
