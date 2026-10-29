import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  whiteText?: boolean;
  customLogoUrl?: string;
  namaSekolah?: string;
}

/**
 * Logo Resmi SMPIT Bunayya (Al-Qur'an terbuka, gelombang piksel digital, dan teks SMPIT BUNAYYA)
 */
export const OFFICIAL_BUNAYYA_LOGO =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAP8AAADGCAMAAAAqo6adAAAAA3NCSVQICAjb4U/gAAAAZlBMVEX///9iYff3+fsvpCMeoQwAAPLw8P8OCfUAAPU1pirLyv2npvo2NPbZ2f3i4f2Li/mzs/p7efdLSfbQ6M6+vvxvbvay2bCZmPoiIPXo9OZYV/dkt1xIrUCUzJAaF/V9wXcpI+/k5uwZU3ahAAAAX3pUWHRSYXcgcHJvZmlsZSB0eXBlIEFQUDEAAAiZ40pPzUstykxWKCjKT8vMSeVSAANjEy4TSxNLo0QDAwMLAwgwNDAwNgSSRkC2OVQo0QAFmJibpQGhuVmymSmIzwUAT7oVaBst2IwAAA/lSURBVHic7V2Llqo6DBW0tQLyEhSZ0fH8/0/eJn1jUQdHUS97nXWvMgjdaZImaSmz2YQJEyZMmDBhwoQJEyZMmDBhwoQJEyYMx+awGbsJo+JrsVgdtuHYzRgN89VqNV8svrb7sVsyCvaLFYKL4HvstoyBjeTPsRi7LWPge67oz3/GbssYsLr//zMObL4PG+HxjfrPF/+fMeCwWIDH5x2+4cPfAk1g/jV2q56H77nl8feHbxDBYjuLWBCnY7ftCdBjnury/ZarwWZWM46miOiorXs8lNHzLtcIt7OQLTlABkH+0b5gK22+4/Eq5C9lUMYfrAX7Ddh8N+ALNH8UAfloEXCFP2zdAzZ9KYIg+mhDcFB1+aMIjsV67IY9Cdz7nwsAXEGSj920R2FzsNQ7zVrw/T4RkN1negLuBL/sqD+MipKLgHiUIPhAM4A4aL74PjiVDxoHPi3gI+LHSeCwkJWPzvEwqj0i4BKIRmnm32IjEh+OcNGf+NO4PBcBt4L3Tw++5nNI/g4bLglR+1j4K390d/RIoH53T/glst3FgcfBPxAHX0h889IjgfiJjX0AnGpPuMHErx9p0ZUAYck7G4HKfVf6wPbS6dwMzuIixrJHt/JxwNxv3vV5YX6hTz0SSN7XC/DcD5K/g3Nwx4OeouollbYdCTDy3jHxfuP6/IRBjEfKvE8EUeMKgLDd41v5NKyZsux+EWRdFaif28Y/x9ZM/O4MNUj6K+/50bIjgPJpTX0I+Mj3/SNEUDtJD0/6M58ShPUnCUAkPzL0T+Pazn35x9oX68cdAQRPbfGfIsQi8NyUAMMoOzoi8GU7EXEkwIontviPsYVZj4Ub/KyzaxJIXS/I3nkYDLdf87PYN2qNK2CsPQuLqCMAQt43EOpDmtk6cBbquhrw9qOgD6EtgaZb9olcC3jXqtDm0oIfatI+dhbpxZ+gAPuFGvtC7xRHWhoVaDtnuBNF75kNc/5z8SkmtXeWJzYqkLh/pw7/Nx0CNioFShjGvOcioFoFWOO6+cwSwPsGQYIxJcAf5/rOziiMBjjHqR0tN09p7OOQ5qLgz1hzVtrTHd2J9Go7YXpaSx+HqAAR8H9dCWhf75p59GH8oeB/RAkcO1agerpjAR/HnyM/oRXUric8KQFEvqP8+OmZbbyG+5YrYNzHls6IrmtDTrZvRQc3VwEevJRiL9a0fN2zlj1NUAWcrtYWYB+0+N8yHxJufla8cauvRy0y36g1TfM717LXKAA7qFe+jtkxQGL4X4//Nj9yjSUUXH42f6QHhe6l7Q/v+ZUB3OXKrEY/ILh1nd2RnfPX5eCr4c+GN27uNG5lGpcOn06M9MIUtYJ11RHBQCVAL2grdSv5W/1mIuDL+d9++33eNmgcti0KyPCpJCzZE1iitj94BAB3+Rq0ojvqKkDAzsa57Kbu3/gbJhed5Al426EFlEo2ihQpVHK8Yp4vvod4Au7b2NH6LvnbPaXUn7D+5m9cozTsYb0JzZYivRpaQtRz8zJw3/RIYIAZZB3+wtfbfq4nKrRxmPt1cgHDEy2Iaf5vmydAM3MJlsCMBUxle+T9ezMA/tagLmzdrnOoGuB5aURi/9PTlG/wfGtu9kRegNTDywdVaSRA4rDX3rgEfjUa8KzPjgDQ1tnS8n6Jou9fD7TpY4+zLVFCdKtP8X1j4bomuisIzNn0OoLVLyTQMNurUbLsRAStdD2t1/a9hoijHjfEMG6M4pf+ebZfgcZKAlyncI3e9st3f+l2bgEPgm2fBN6QlUZLQ3QHPYvBwm2P2X/DfLuxWem3/wKhGEcskXL980lgPj/com0Zc/oFloHZ0UCFWSJLvKrPnZ5X8YXZF5bZ/+nScnAoSq5HMKke/8MH3ms6ELaZ3S85dLQljgjF0WS+vttv+24KZm85K5L8geK7cDQrw5ioRxF/bh8MuLGSxHogKIyhVJjsvBEfBGG9ZhfGS0vxHzJj4JgBOoI+R3TjcPhvVzpPAkXc1zZ15bfa8Men+eB2927nHB/4TIVlBgS9kz8iAHO87gjCf/a3KmjKrPe5KL/DkcNuWlut+nPFd5HGRtINhGb+iACisN/ERGEV9eusP8XRo31JHqz4HWgzUKv2D97mLbrLvochhAfnvJfHsPusMc+ANgMQeW9MhI8/3rntwfanJ95Esw/1+mFYVfXM54hsh9NKR+CNCBbDEkQArpz1XxRH+7QwZu9dS/Ny0PxkJZDImMg3POHODwMMoafn9fAS1UYHR3qkFjwPkYPOLhThibfJEKHcFBlKwLKR/isJs1dOj5xGfJJUq6CKtv2OQBnCTSNCr9oD+xWIUUykLOXjgw+meAU0lmZApBH2OAJCFdzxE2f2sPv52j2mZG5N0p+NqJWmYGIPnpSA0nhUmy48Y+k8qf4S8jHpc29zkODlhksITkKex0BakGPN8Tlcj2/WqhYx1W214FlkhiG9DqClT9BuKA0nD3m1aEyNZmAvRiqwPQNmKU/OfJLgKd2veeuZEHTmH1yZ03rUTBmIJKjvb88rSRgSFzoe24SICmd4ozv8S9BF99kctSTsksJSBUIvy+wF2bfkpfy+Jeg0jFdLl31OzXhB7/7x0v0lMbsm96HR14Ja2kGqvTeM2ugloYfev4ogny6Excjr634LkyAJmeOeswAHpHa9CQNX3aK84fF3Ceh0maQXHAE3AK++nP7tTb75kU9/iWYvltiRc7nCBbb/blYuNkDW1nZeIEYfyioHA2U2z6PCOY/2w5/qGyEZiB5P8V3Uck8VRWMz1yhq/7K6WnVeUfFd6EmEBkr0RH053fdysbji7nPgVqIIGeOesqlKzF9qVKcZxVznwNpBrJc6kmO5KqFWaycXrN7d8V3Ic1AxUR7xxHI0V4ryocovgs1jy4LxiYiUJWNQknorT3+JeghHZfBiyqJjHVk2gDlg89SfBdy5kRNz2+/cNVCKGvpn6n4LmRCo9Q81IYBruFzPP4FmN6GwFaWcz93BzAfIlHFZSSRH16omPsc6G4Xiv+mGc49CEWs85rF3OcgKo6k/XiPb5DmVbxri5IlpyMh5HgqE/4PPzbJ8VQHRZzH9AO1IVzHRXCExyAZ/kdhiSv9OiCEy+FzdkhO81owtx/pvQwphXj97qFgWtXLXzG3gA/Ntvn7hkRpVKB3C1NIE3xjoMjjRNyJ3ctAnZ8t4wwCv6IvBZB8j77pVsr8L1kPC5fjwYXRCBKR6+PzN/1ZnjjeU9SF9muCCTqXVbUZdBwn69FcQ6YV395CYTxGXs5pp/KOs6jNb1oyZSmVRXXdUO8I+bL60BMnJ2dBfOERzPpL9tN6TovyoZ0hcCThdf1A2liNxZ3Oyyq9J720igTYaMtgVdNGDKzcxnud+J/iuH3SOPiaFkVY8ErGkGqn9fm3E+79d+2cR1bsRQjrxcRxWYRfvugBzAq61G84sW8QK3WvPTvb/oXqPQKq9Mr2QAtVe3+4XEqVXMI5HUSo7TBOtazavcwh/BKTiDlzZHz+08CxeccX2RbsJTc94z1IMBq0Nv2RXk0gP4Y760IYT+p8TWAEtaMZIhpydjoseCRjLhTfU7IyIWR9jhqA8KAjBoIZaNvzZmPuUN29QIOOBpxl/yXeJ/zSzRiwoTPA82SUyln56M2CAITb8X8W5uKo1DCjUUImPLv2WwX2BABQrwTkCfCOa38SEt+AX6GdWe4uv1F3Tjn1291vLWGu9eBuZJopj4BGnkH/UoWo3G7Svxi9izDP6xnuanelyCnNXyYFU5ZX4xQjf5+wsbC2xBkO6m4cmMFknCepgS/UV/gMno7XNwqhZp7dP9+ZOyOzcMjVcvFvYlxNzS9QxfuWIj8rXpniFtZstZs6ovHRUda2xkib2sLKMpwN7jECmdhMkR9hqvpG0MzVN6D28jluFWY+iV+VmKEfTXveH/Cki3l5C3cUPBXg21t8VczFrClk+Bfq+K91f+JOhP+R/38iaZp88cL6SgbN0sSQd9J/A62ilN9zpiStxTccvDesUityPNC7EEm+CvVYoY/K9Ioz7AEQiX/uCiKrIU9zjL+aaf4syzPYygVwQV9/J3rq4a7NxaditLQfR1pnchsVZGNHJqd1SrBjmLdDHVx+UXwF10DnZFL/kp+doKeKL6FYOvlr3eFs/jLvQE1jVpxhHOEe0OZhmIfOaMpYlfRwZuHQ4OtIqOknNltsvnv8FOH/869HHJIRWP9/NXVDH/ktLQ2x6PS1Ky+TiVvLhpru8RA/nJghtQyp8Ik+eOuhfI9xg7/GCzhFv4UGtnLX3oywx+uG4ifSMCrlNgaNkjXzg1dJKWWb5SNDNjgMhnK18y2VZqz/dnwL1Hdb+BfXdL/paXbM33dNdAwpQ6YQm8L4weBK/9Ww1lLfRbcP4jY4HcohcJVKwlUlh6W8vNakwylNl7lH0aM9fs/vCrsg6j5p0BTKIG+VKUWjhr3EqtDxtuVKDPhlgchlUPYTt0U9BDCEqo0S/BvkkQMa+3sMn81UmK/+f1/IX2g5i/cSujasdwu1H4tgNgu1eprNAbLiw8RQIIRkHgVIfDftdhoNPWCWeO/CGvoNf4qAILDfv5hK1yZ5t/gbcCXWTTWnSFhpp29ifaEP4LjnX3lf4NYqkAo+GdoU6hZUc2c+I+JF1jc0P+y5X7+NMRAAt4FyCRT7ObKtWOlJhZKZ5Aw/oaxe16gI97TA7aH/FEPKVpBwJz4T2Yol+2/zrIA+Z16+eNYJiQKf8rURZbOaEzZsstq7Vo6+A0cq3ZsedfLRGkiLoz8kTXaqeHPMmvF7g3+PxJtr3v4q8FF8IfeOzVNc1o67i504jxF2OYPg+QRftkwd6vh32OJY6jgr0aBtc3fOvcG/tIlxczOY0BzVcAlX5UI/CudRLj+jl7lf3R+edcMRYEtFfxn2vMO55/hb3Jj0eKACThldDlzXoLieLer/NfuDwclgYV8KVODLZf8C5UGDucfqEhJB4QiujEBd6MSNz1migFW07jKv+j8cgh9/sssSiuZXEj+IvFPh/HH/lNpG/qVOE1zFaQb/lTyh0skeZzH/N/ODu6u8ofgOBY/zBMneLwVsWVAQFHyB8PCAXUI/1OSiGdejt0b1DMn4YpEnzmjfmMc5lX+zqjvBo83w7yhDpur+GeyTQP466Xwgof1gg+M7eyEE3pbsNRdmjEzvl/jH9j37njGmxGpGk6j4r9sJip8dCB/xVb0KT2qkU4YhpNwZzLqL+1Lazu+wr8zPCZsYBIIO++o1kKlsxBXQ4LwEss1BIguf6JrkZ0/GXdk1kpk4oDc5fzIr2gFMAkesGJ30xZ8o1hnARDcWf0cbm0SQXj19tBXiNFINTaklNqVBP6Vnh+Vhz0/oAr22WEUx/qd4N0/dg9Q64Jn5zqHqHvr0HP2hAkTJkyYMGHChAkTJkyYMGHChAkTJkyYMGHChM/Ef4hcTrxfXhu1AAAAAElFTkSuQmCC';

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showText = true,
  whiteText = false,
  customLogoUrl,
  namaSekolah = 'SMPIT BUNAYYA',
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24 sm:w-28 sm:h-28',
  };

  // Gunakan logo kustom jika ada, atau gunakan Logo Resmi SMPIT Bunayya
  const effectiveLogoUrl =
    customLogoUrl && customLogoUrl.trim() !== ''
      ? customLogoUrl
      : OFFICIAL_BUNAYYA_LOGO;

  return (
    <div className="flex items-center gap-3">
      <div
        className={`relative ${sizeClasses[size]} shrink-0 flex items-center justify-center rounded-2xl overflow-hidden bg-white shadow-md p-1.5 border border-slate-200/80 dark:border-white/10`}
      >
        <img
          src={effectiveLogoUrl}
          alt={namaSekolah}
          className="w-full h-full object-contain"
        />
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-bold tracking-tight leading-none ${
                size === 'lg' ? 'text-xl' : size === 'xl' ? 'text-2xl' : 'text-base'
              } ${whiteText ? 'text-white' : 'text-slate-900 dark:text-white'}`}
            >
              {namaSekolah}
            </span>
            <span
              className="px-1.5 py-0.5 rounded text-[10px] font-semibold border"
              style={{
                backgroundColor: 'var(--theme-primary-light)',
                color: 'var(--theme-primary-dark)',
                borderColor: 'var(--theme-primary)',
              }}
            >
              E-SURAT
            </span>
          </div>
          <span
            className={`text-[11px] leading-tight mt-0.5 ${
              whiteText ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            Sistem Informasi Tata Usaha & Kearsipan
          </span>
        </div>
      )}
    </div>
  );
};
