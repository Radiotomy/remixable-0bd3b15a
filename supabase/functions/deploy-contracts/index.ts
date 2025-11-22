import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createPublicClient, createWalletClient, http, parseEther } from 'npm:viem@2.37.7'
import { base } from 'npm:viem@2.37.7/chains'
import { privateKeyToAccount } from 'npm:viem@2.37.7/accounts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Supabase client for database operations
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Web3 configuration
const BASE_RPC_URL = Deno.env.get('BASE_RPC_URL') || 'https://mainnet.base.org'
const DEPLOYER_PRIVATE_KEY = Deno.env.get('DEPLOYER_PRIVATE_KEY')

// Contract ABIs (simplified for deployment)
const AppTokenABI = [
  {
    inputs: [
      { name: 'name', type: 'string' },
      { name: 'symbol', type: 'string' },
      { name: 'totalSupply', type: 'uint256' },
      { name: 'owner', type: 'address' },
      { name: 'revenueContract', type: 'address' }
    ],
    stateMutability: 'nonpayable',
    type: 'constructor'
  }
]

const TokenFactoryABI = [
  {
    inputs: [
      { name: 'name', type: 'string' },
      { name: 'symbol', type: 'string' },
      { name: 'totalSupply', type: 'uint256' },
      { name: 'revenueContract', type: 'address' }
    ],
    name: 'createToken',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'nonpayable',
    type: 'function'
  }
]

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { tokenConfig, userId } = await req.json()
    
    console.log('Deploying contracts to BASE mainnet for:', tokenConfig.name)
    
    if (!DEPLOYER_PRIVATE_KEY) {
      throw new Error('DEPLOYER_PRIVATE_KEY not configured')
    }
    
    // Deploy contracts
    const deploymentResults = await deployRealContracts(tokenConfig, userId)
    
    console.log('Contract deployment completed:', deploymentResults)
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        deployment: deploymentResults 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
    
  } catch (error) {
    console.error('Contract deployment error:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})

async function deployRealContracts(tokenConfig: any, userId: string) {
  // Setup wallet and client
  const account = privateKeyToAccount(DEPLOYER_PRIVATE_KEY as `0x${string}`)
  
  const publicClient = createPublicClient({
    chain: base,
    transport: http(BASE_RPC_URL),
  })
  
  const walletClient = createWalletClient({
    account,
    chain: base,
    transport: http(BASE_RPC_URL),
  })
  
  console.log('Deployer address:', account.address)
  
  // Check deployer balance
  const balance = await publicClient.getBalance({ address: account.address })
  console.log('Deployer balance:', balance.toString(), 'wei')
  
  if (balance < parseEther('0.001')) {
    throw new Error('Insufficient ETH balance for deployment. Need at least 0.001 ETH on BASE mainnet.')
  }
  
  // For MVP: Use hardcoded factory and revenue addresses
  // In production, these would be deployed once and reused
  const factoryAddress = '0x0000000000000000000000000000000000000000' // TODO: Deploy factory once
  const revenueAddress = '0x0000000000000000000000000000000000000000' // TODO: Deploy revenue contract once
  
  // Calculate total supply in wei (token has 18 decimals)
  const totalSupplyWei = parseEther(tokenConfig.totalSupply.toString())
  
  // For now, deploy a simple ERC20 token directly
  // In production, we'd call the factory contract
  console.log('Deploying app token:', tokenConfig.name, tokenConfig.symbol)
  
  // This is a placeholder - actual bytecode would come from compiled Solidity
  // For real deployment, we need the compiled contract bytecode
  throw new Error('Contract bytecode not yet configured. Deploy contracts using Hardhat/Foundry first.')
  
  // Example of how it would work with factory:
  /*
  const { request } = await publicClient.simulateContract({
    address: factoryAddress as `0x${string}`,
    abi: TokenFactoryABI,
    functionName: 'createToken',
    args: [
      tokenConfig.name,
      tokenConfig.symbol,
      totalSupplyWei,
      revenueAddress
    ],
    account
  })
  
  const hash = await walletClient.writeContract(request)
  console.log('Token creation transaction:', hash)
  
  const receipt = await publicClient.waitForTransactionReceipt({ hash })
  console.log('Token deployed at block:', receipt.blockNumber)
  
  // Get token address from event logs
  const tokenAddress = receipt.logs[0].address
  
  // Save to database
  const { data: appToken, error: tokenError } = await supabase
    .from('app_tokens')
    .insert({
      user_id: userId,
      app_name: tokenConfig.name,
      token_name: tokenConfig.name,
      token_symbol: tokenConfig.symbol,
      token_address: tokenAddress,
      total_supply: tokenConfig.totalSupply,
      chain_id: base.id
    })
    .select()
    .single()
  
  if (tokenError) throw tokenError
  
  // Save deployment record
  const { error: deployError } = await supabase
    .from('contract_deployments')
    .insert({
      user_id: userId,
      app_token_id: appToken.id,
      contract_type: 'token',
      contract_address: tokenAddress,
      transaction_hash: hash,
      block_number: Number(receipt.blockNumber),
      gas_used: Number(receipt.gasUsed),
      deployment_cost: 0, // Calculate from gas
      status: 'confirmed'
    })
  
  if (deployError) throw deployError
  
  // Save config
  await supabase
    .from('mini_app_configs')
    .insert({
      user_id: userId,
      app_token_id: appToken.id,
      config: tokenConfig
    })
  
  return {
    tokenAddress,
    factoryAddress,
    revenueAddress,
    transactionHash: hash,
    blockNumber: receipt.blockNumber.toString(),
    gasUsed: receipt.gasUsed.toString(),
    network: 'base',
    chainId: base.id
  }
  */
}