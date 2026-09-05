import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'


const axiosMock = vi.hoisted(() => {
  const requestInterceptor = {
    fulfilled: null,
    rejected: null,
  }

  const instance = {
    interceptors: {
      request: {
        use: vi.fn(
          (fulfilled, rejected) => {
            requestInterceptor.fulfilled =
              fulfilled

            requestInterceptor.rejected =
              rejected
          }
        ),
      },
    },
  }

  return {
    create: vi.fn(
      () => instance
    ),

    instance,
    requestInterceptor,
  }
})


vi.mock('axios', () => ({
  default: {
    create: axiosMock.create,
  },
}))


let api


beforeEach(async () => {
  localStorage.clear()
  sessionStorage.clear()

  vi.clearAllMocks()
  vi.resetModules()

  axiosMock.requestInterceptor.fulfilled =
    null

  axiosMock.requestInterceptor.rejected =
    null

  api = (
    await import('../api')
  ).default
})


describe('api service', () => {
  it(
    'creates the Axios instance with the backend configuration',
    () => {
      expect(
        axiosMock.create
      ).toHaveBeenCalledTimes(1)

      expect(
        axiosMock.create
      ).toHaveBeenCalledWith({
        baseURL:
          'http://127.0.0.1:8000/api',

        headers: {
          'Content-Type':
            'application/json',
        },
      })

      expect(api).toBe(
        axiosMock.instance
      )
    }
  )


  it(
    'adds the access token from localStorage to the request',
    () => {
      localStorage.setItem(
        'accessToken',
        'local-access-token'
      )

      const config = {
        headers: {},
      }

      const result =
        axiosMock
          .requestInterceptor
          .fulfilled(config)

      expect(
        result.headers.Authorization
      ).toBe(
        'Bearer local-access-token'
      )

      expect(result).toBe(config)
    }
  )


  it(
    'uses the access token from sessionStorage when localStorage has no token',
    () => {
      sessionStorage.setItem(
        'accessToken',
        'session-access-token'
      )

      const config = {
        headers: {},
      }

      const result =
        axiosMock
          .requestInterceptor
          .fulfilled(config)

      expect(
        result.headers.Authorization
      ).toBe(
        'Bearer session-access-token'
      )

      expect(result).toBe(config)
    }
  )


  it(
    'prioritizes localStorage when both storages contain an access token',
    () => {
      localStorage.setItem(
        'accessToken',
        'local-access-token'
      )

      sessionStorage.setItem(
        'accessToken',
        'session-access-token'
      )

      const config = {
        headers: {},
      }

      const result =
        axiosMock
          .requestInterceptor
          .fulfilled(config)

      expect(
        result.headers.Authorization
      ).toBe(
        'Bearer local-access-token'
      )

      expect(result).toBe(config)
    }
  )


  it(
    'does not add an Authorization header when there is no access token',
    () => {
      const config = {
        headers: {},
      }

      const result =
        axiosMock
          .requestInterceptor
          .fulfilled(config)

      expect(
        result.headers.Authorization
      ).toBeUndefined()

      expect(result).toBe(config)
    }
  )


  it(
    'rejects errors received by the request interceptor',
    async () => {
      const error =
        new Error('Request error')

      await expect(
        axiosMock
          .requestInterceptor
          .rejected(error)
      ).rejects.toBe(error)
    }
  )
})
