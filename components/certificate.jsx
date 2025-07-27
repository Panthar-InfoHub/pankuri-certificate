export default function Certificate({ name = "Gagan", course = "Btech", date = "26*8/85", mode = "dev" }) {

  const ribbonImgUrl = "https://res.cloudinary.com/dq6ubifli/image/upload/v1753638293/ribbon_aqdxld.png"

  return (
    <div id="certificate-design" style={{
      minHeight: '100vh',
      backgroundColor: 'white',
      padding: '64px 32px', // lg:p-16 equivalent
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '896px', // max-w-4xl
        border: '1px solid #d1d5db', // border-gray-300
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', // shadow-lg
        overflow: 'hidden',
        position: 'relative'
      }}>
        {/* Top Section - Dark Blue */}
        <div style={{
          backgroundColor: '#040159',
          color: 'white',
          textAlign: 'center',
          padding: '64px 32px', // py-16 px-8
          position: 'relative',
          zIndex: 10
        }}>
          <h2 style={{
            fontSize: '30px', // md:text-3xl
            fontFamily: 'serif',
            letterSpacing: '0.25em', // tracking-widest
            marginBottom: '8px',
            margin: '0 0 8px 0'
          }}>
            ACADMA
          </h2>
          <h1 style={{
            fontFamily: "'My Soul', cursive", // My_Soul font with fallback
            fontSize: '128px', // lg:text-8xl
            fontWeight: 'bold',
            fontStyle: 'italic',
            lineHeight: '1', // leading-none
            marginBottom: '16px',
            margin: '0 0 16px 0'
          }}>
            Certificate
          </h1>
          <p style={{
            fontSize: '24px', // md:text-2xl
            fontFamily: 'serif',
            letterSpacing: '0.25em', // tracking-widest
            margin: '0'
          }}>
            OF APPRECIATION
          </p>
        </div>

        {/* Gold Ribbon Shapes */}
        <div style={{
          position: 'relative',
          display: 'flex',
          justifyContent: 'space-between',
          height: '48px', // h-12
          marginTop: '-4px' // -mt-1
        }}>
          <div style={{
            backgroundColor: '#c8b100',
            width: '48%',
            height: '100%',
            clipPath: 'polygon(0 0, 100% 0, 90% 60%, 0% 60%)'
          }}></div>
          <div style={{
            backgroundColor: '#c8b100',
            width: '48%',
            height: '100%',
            clipPath: 'polygon(10% 60%, 100% 60%, 100% 0, 0 0)'
          }}></div>
        </div>

        {/* Middle Section - White */}
        <div style={{
          backgroundColor: 'white',
          textAlign: 'center',
          padding: '64px 32px' // py-16 px-8
        }}>
          <p style={{
            fontSize: '30px', // md:text-3xl
            fontFamily: 'serif',
            marginBottom: '32px', // mb-8
            margin: '0 0 32px 0'
          }}>
            This certificate is proudly presented to
          </p>
          <div style={{
            borderBottom: '1px solid #9ca3af', // border-gray-400
            width: '75%', // w-3/4
            margin: '0 auto 48px auto', // mx-auto mb-12
            height: '32px', // h-8
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#040159'
          }}>
            {name}
          </div>
          <p style={{
            fontSize: '30px', // md:text-3xl
            fontFamily: 'serif',
            marginBottom: '16px', // mb-4
            margin: '0 0 16px 0'
          }}>
            For Successful Completion of The Course
          </p>
          <p style={{
            fontFamily: 'serif',
            fontSize: '48px', // md:text-5xl
            fontWeight: 'bold',
            margin: '0',
            color: '#040159'
          }}>
            {course}
          </p>
        </div>

        {/* Bottom Section - White with Date, Signature, and Seal */}
        <div style={{
          backgroundColor: 'white',
          padding: '44px 32px 64px', // py-16 px-8
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          gap: '32px', // gap-8
          flexDirection: 'row',
          flexWrap: 'wrap'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            <div style={{
              borderBottom: '1px solid #9ca3af', // border-gray-400
              width: '192px', // w-48
              marginBottom: '8px', // mb-2
              height: '32px', // h-8
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              fontWeight: 'bold'
            }}>
              {date}
            </div>
            <p style={{
              fontSize: '18px', // text-lg
              fontFamily: 'serif',
              margin: '0'
            }}>
              Date
            </p>
          </div>

          {/* Award ribbon seal - CSS recreation */}
          <div style={{
            position: 'relative',
          }}>
            <img
              src={mode === "server" ? ribbonImgUrl : "/ribbon.png"}
              alt="Award_ribbon_seal"
              style={{ width: "8rem", objectFit: "cover" }}
            />
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            <div style={{
              borderBottom: '1px solid #9ca3af', // border-gray-400
              width: '192px', // w-48
              marginBottom: '8px', // mb-2
              height: '32px' // h-8
            }}></div>
            <p style={{
              fontSize: '18px', // text-lg
              fontFamily: 'serif',
              margin: '0'
            }}>
              Signature
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}


