import HelperCard from './HelperCard'

type Helper = {
  name: string
  mobile: string
  skill: string
  address: string
  picture_url: string
}

type Props = {
  helpers: Helper[]
}

const HelpersList = ({ helpers }: Props) => {
  return (
    <>
      {helpers.map((helper, index) => (
        <HelperCard profilePicture={undefined} key={index} {...helper} />
      ))}
    </>
  )
}

export default HelpersList
