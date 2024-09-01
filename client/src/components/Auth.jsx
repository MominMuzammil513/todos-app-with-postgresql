import { useState } from 'react'
import { useCookies } from 'react-cookie'

const Auth = () => {
  const [cookies, setCookie, removeCookie] = useCookies(['Email', 'AuthToken'])
  const [isLogIn, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")

  const viewLogin = (status) => {
    setError("")
    setIsLogin(status)
  }

  const handleSubmit = async (e, endpoint) => {
    e.preventDefault()
    
    if (!isLogIn && password !== confirmPassword) {
      setError('Passwords do not match!')
      return
    }
    
    try {
      const response = await fetch(`http://localhost:8000/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()
      console.log(data,"===========");

      if (data.message) {
        setError(data.message)
      } else {
        setCookie('Email', data.email, { path: '/' })
        setCookie('AuthToken', data.token, { path: '/' })

        window.location.reload()
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
      console.error('Error:', err)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-container-box">
        <form>
          <h2>{isLogIn ? 'Please log in' : 'Please sign up!'}</h2>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {!isLogIn && (
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          )}
          <input
            type="submit"
            className="create"
            value={isLogIn ? 'Log In' : 'Sign Up'}
            onClick={(e) => handleSubmit(e, isLogIn ? 'login' : 'signup')}
          />
          {error && <p>{error}</p>}
        </form>
        <div className="auth-options">
          <button
            onClick={() => viewLogin(false)}
            style={{ backgroundColor: !isLogIn ? 'rgb(255, 255, 255)' : 'rgb(188, 188, 188)' }}
          >
            Sign Up
          </button>
          <button
            onClick={() => viewLogin(true)}
            style={{ backgroundColor: isLogIn ? 'rgb(255, 255, 255)' : 'rgb(188, 188, 188)' }}
          >
            Login
          </button>
        </div>
      </div>
    </div>
  )
}

export default Auth
