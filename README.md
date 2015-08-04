# Secure Multi-party transfer

A front-end and back-end demonstration on how a secure multi-party transfer system would function, using RSA as the primary encrypting method.

## Example

Party A would like to write a research paper on the data it has collected, but there is not enough data to produce meaningful work.
Party B and C would love to assist A by contributing their data, but laws prohibit each party from knowing the other parties exact contribution.

The idea is to obtain data in such a way that the aggregate data of any number of parties is achieved, 
while the individual contribution per party is obfuscated. This is how it works:
1. A randomly generated seed is injected into the first value of the first party.
2. Using We take the public key of the next-in-line party, encrpyt it, and send the encrypted data along to that party.
3. The receiving party decrypts with their secret key and inserts their data. (Note that with the injected random seed, any parties after the first
do not know individual components)
4. Steps 2 and 3 continue until the last person; The aggregate data is sent to the first party once the data has passed around all parties.
5. The random seed is removed from the data to get the aggregate

## Example cont.

R - Represents the random seed
1. R
2. R + 10 = R + 10
3. R + 10 + 20 = R + 30
4. R + 10 + 20 + 30 = R + 60
5. Final - R + 60 - R = 60 (Aggregate)
